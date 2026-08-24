import {TokenUtil} from "./utils";
import {PinoLogger} from "nestjs-pino";
import {randomUUID} from "node:crypto";
import {Injectable} from "@nestjs/common";
import {AuthRepository} from "./auth.repository";
import {AppException} from "@live-bid/services/lib";
import {compareSecret, hashSecret} from "@app/auth/lib";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {UserRepository} from "@app/auth/modules/user/user.repository";
import type {LoginResponse, NormalizeClientInfoType} from "@live-bid/services/types";

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly tokenUtil: TokenUtil,
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /** **Register User** */
  async register(userData: ZodSchemas.RegisterUserSchemaType) {
    const hashedPassword: string = await hashSecret(userData.password);

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

  async login(userData: ZodSchemas.LoginUserSchemaType, clientInfo: NormalizeClientInfoType): Promise<LoginResponse> {
    // Find user in database with password
    const user = await this.userRepository.findOne(
      {
        email: userData.email,
        username: userData.username,
      },
      false
    );

    // Throw exception if user doesn't in database
    if (!user) throw new AppException({
      statusCode: 404,
      code: "User not found",
      message: "User does not exist in database, please check phone and try again",
    });

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

    const tokens = this.tokenUtil.getTokens(
      {
        sub: safeUser.id,
        role: safeUser.role,
        jti: randomUUID() + Date.now(),
        display_name: safeUser.display_name,
      },
      userData.remember
    );

    const {hashedRefreshToken, refreshToken, accessToken, expires_at} = tokens;

    const accessOptions = this.tokenUtil.getCookieOptions('access');
    const refreshOptions = this.tokenUtil.getCookieOptions('refresh', userData.remember);

    await this.authRepository.insertRefreshToken({
      user_id: safeUser.id,
      expires_in: expires_at,
      client_info: clientInfo,
      replace_by_token_id: null,
      token_hash: hashedRefreshToken,
    });

    this.logger.info({userId: safeUser.id}, 'User logged in');

    return {
      accessToken,
      refreshToken,
      user: safeUser,
      accessOptions,
      refreshOptions
    };
  }
}
