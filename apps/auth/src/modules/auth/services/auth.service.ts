import type {
  SafeUser,
  RefreshTokenPayload,
  LoginResponseService,
  RefreshRequestService,
  NormalizeClientInfoType,
  RegisterResponseService,
  ValidateRefreshRequestService,
} from "@live-bid/services/types";

import {TokenUtil} from "../utils";
import {PinoLogger} from "nestjs-pino";
import {randomUUID} from "node:crypto";
import {Injectable} from "@nestjs/common";
import {AuthRepository} from "../auth.repository";
import {compareSecret, hashSecret, hashSecretToken} from "@app/auth/lib";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {UserCacheService} from "@app/auth/modules/user/services";
import {AppException, throwNotFoundEx} from "@live-bid/services/lib";
import {UserRepository} from "@app/auth/modules/user/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly tokenUtil: TokenUtil,
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly userCacheService: UserCacheService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /** **Register User** */
  async register(userData: ZodSchemas.RegisterUserSchemaType): Promise<RegisterResponseService> {
    // Hash user password
    const hashedPassword: string = await hashSecret(userData.password);

    // Insert user record in db
    const user = await this.userRepository.insertUser({
      ...userData,
      password: hashedPassword,
    });

    this.logger.info(
      {userId: user.id, display_name: user.display_name},
      "User registered successfully",
    );

    return user;
  }

  /**
   * **Login user with password and username/email**
   * @param userData - user data: password - email - username
   * @param clientInfo - Client info
   *
   * @returns LoginResponseService
   *  */
  async login(userData: ZodSchemas.LoginUserSchemaType, clientInfo: NormalizeClientInfoType): Promise<LoginResponseService> {
    // Find user in database with password
    const user = await this.userRepository.findOne(
      {
        email: userData.email,
        username: userData.username,
      },
      false
    );

    // Throw exception if user doesn't in database
    if (!user) throw throwNotFoundEx('User');

    // Check password
    const isValidPassword = await compareSecret(userData.password, user.password);

    // Throw exception if password is invalid
    if (!isValidPassword) {
      this.logger.warn({id: user.id}, 'Login failed: invalid credentials');

      throw new AppException({
        statusCode: 401,
        code: 'Invalid Credentials',
        message: "Invalid user credentials",
      });
    }

    const {password, ...safeUser} = user;
    void password;

    // Generate refresh and access tokens
    const tokens = this.tokenUtil.getTokens(
      {
        sub: safeUser.id,
        role: safeUser.role,
        jti: randomUUID() + Date.now(),
        display_name: safeUser.display_name,
      },
      userData.remember
    );

    const {hashedRefreshToken, refreshToken, accessToken, expires_in} = tokens;

    // Generate access and refresh options
    const accessOptions = this.tokenUtil.getCookieOptions('access');
    const refreshOptions = this.tokenUtil.getCookieOptions('refresh', userData.remember);

    // Create a session in db
    await this.authRepository.insertRefreshToken({
      expires_in,
      user_id: safeUser.id,
      client_info: clientInfo,
      replace_by_token_id: null,
      token_hash: hashedRefreshToken,
      remember_me: userData.remember,
    });

    // Set user cache
    void this.userCacheService.setCacheUserInfo(safeUser);
    this.logger.info({userId: safeUser.id}, 'User logged in');

    return {
      accessToken,
      refreshToken,
      user: safeUser,
      accessOptions,
      refreshOptions
    };
  }

  /**
   * **Validate refresh token from refresh guard**
   * */
  async validateRefresh({userId, tokenHash}: ValidateRefreshRequestService): Promise<RefreshTokenPayload> {
    // Get user from cache if exists.
    const userCached = await this.userCacheService.getCachedUserInfo(userId);

    function handleThrowRefresh() {
      throw new AppException({
        statusCode: 401,
        code: 'REFRESH_TOKEN_EXPIRE',
        message: 'Invalid or expired refresh token',
      });
    }

    let tokenRecord: RefreshTokenPayload;

    // If user cache exists
    if (userCached) {
      // Get session/token from db
      const [findToken] = await this.authRepository.findRefreshRecord(tokenHash);

      // If token not exists, Throw an exception
      if (!findToken) handleThrowRefresh();

      // Else, complete token record object
      tokenRecord = {
        refreshRecord: findToken,
        user: userCached
      };
    } else {
      // If user cache not exists, find user from db
      const [findToken] = await this.authRepository.findRefreshRecordWithUser(tokenHash);

      // If token not exists, Throw an exception
      if (!findToken) handleThrowRefresh();

      // Cach user
      void this.userCacheService.setCacheUserInfo(findToken.user as SafeUser);

      const {user, ...refreshRecord} = findToken;

      tokenRecord = {
        refreshRecord,
        user: user as SafeUser,
      };
    }

    // If this token is revoked
    if (tokenRecord.refreshRecord.is_revoked) {
      // Revoke all user session.
      void this.authRepository.revokeAllUserTokens(userId).catch((error: Error) => {
        this.logger.error({userId, error}, 'Failed to revoke all user tokens');
      });

      // Throw an exception
      throw new AppException({
        statusCode: 401,
        code: 'REFRESH_TOKEN_REVOKED',
        message: 'Your session has been expired or revoked due to a security issue. Please log in again to continue.',
        meta: {
          clearAuthCookies: true
        }
      });
    }

    return tokenRecord;
  }

  /**
   * **Rotate refresh token**
   *  - Revoke old token
   *  - Insert new session
   * */
  async refresh({refreshPayload, client_info}: RefreshRequestService): Promise<LoginResponseService> {
    const user = refreshPayload.user;
    const remember_me = refreshPayload.refreshRecord.remember_me;

    // Generate refresh and access tokens
    const tokens = this.tokenUtil.getTokens(
      {
        sub: user.id,
        role: user.role,
        jti: randomUUID() + Date.now(),
        display_name: user.display_name,
      },
      remember_me
    );

    const {hashedRefreshToken, refreshToken, accessToken, expires_in} = tokens;

    // Rotate token(revoke old token and insert new token in db)
    await this.authRepository.rotateToken(refreshPayload.refreshRecord.id, {
      expires_in,
      client_info,
      remember_me,
      user_id: user.id,
      replace_by_token_id: null,
      token_hash: hashedRefreshToken,
    });

    // Generate access and refresh options
    const accessOptions = this.tokenUtil.getCookieOptions('access');
    const refreshOptions = this.tokenUtil.getCookieOptions('refresh', remember_me);

    return {
      user,
      accessToken,
      refreshToken,
      accessOptions,
      refreshOptions,
    };
  }

  logout(rawRefreshTokenId: string | null, userId?: string) {
    if (rawRefreshTokenId !== null) {
      const hashedRefreshToken = hashSecretToken(rawRefreshTokenId);
      void this.authRepository.revokeToken(hashedRefreshToken);
      this.logger.info({userId}, 'User logged out');
    }
  }
}
