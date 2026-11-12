import {
  RefreshGuardData,
  DrizzleTransaction,
  RefreshTokenPayload,
  LoginResponseService,
  RefreshRequestService,
  NormalizeClientInfoType,
  RegisterResponseService,
  ResetPasswordRequestService,
  ChangePasswordRequestService,
} from "@live-bid/services/types";

import {v7} from "uuid";
import {TokenUtil} from "../utils";
import {PinoLogger} from "nestjs-pino";
import {randomUUID} from "node:crypto";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {AuthRepository} from "../auth.repository";
import {AuthMailService} from "./auth-mail.service";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {DrizzleService} from "@live-bid/services/modules";
import {compareSecret, hashSecret} from "@app/auth/lib/utils";
import {UsersCacheService} from "@app/auth/modules/users/services";
import {UsersRepository} from "@app/auth/modules/users/users.repository";
import {hashSecretToken, AppException, handleDrizzleError, throwNotFound, AppErrorPayload} from "@live-bid/services/lib";

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly tokenUtil: TokenUtil,
    private readonly config: ConfigService,
    private readonly drizzle: DrizzleService,
    private readonly authMail: AuthMailService,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersCacheService: UsersCacheService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Register a new user.
   *
   * Hashes the password, inserts the user, sends a welcome email
   * (fire-and-forget), and returns the created user record.
   *
   * @param userData - Registration payload (email, username, password, display_name)
   * @param clientInfo - Normalized client info (IP, user-agent, etc.)
   * @returns The created user record
   * @throws {AppException} On duplicate email or other Drizzle-level errors
   */
  async register(userData: ZodSchemas.RegisterUserSchemaType, clientInfo: NormalizeClientInfoType): Promise<RegisterResponseService> {
    // Hash user password
    const hashedPassword: string = await hashSecret(userData.password);

    try {
      // Insert user record in db
      const [user] = await this.usersRepository.insertUser({
        ...userData,
        password: hashedPassword,
      });

      this.logger.info(
        {userId: user.id, display_name: user.display_name},
        "User registered successfully",
      );

      const dashboardLink: string = this.config.get<string>("APPLICATION_DASHBOARD_URL") ?? "http://127.0.0.1:3000/dashboard";

      void this.authMail.authNotification(
        "register",
        userData.email,
        dashboardLink,
        clientInfo
      );

      return user;
    } catch (e) {
      handleDrizzleError({
        e,
        mainResource: 'user',
        conflictField: 'email',
      });
    }
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
    const user = await this.usersRepository.findOne(
      {
        email: userData.email,
        username: userData.username,
      },
      false
    );

    // Throw exception if user doesn't in database
    if (!user) throw new AppException({
      statusCode: 401,
      code: 'Invalid Credentials',
      message: "Invalid user credentials",
    });

    // Check password
    const isValidPassword: boolean = await compareSecret(userData.password, user.password);

    // Throw exception if password is invalid
    if (!isValidPassword) {
      this.logger.warn({id: user.id}, 'Login failed: invalid credentials');

      throw new AppException({
        statusCode: 401,
        code: 'Invalid Credentials',
        message: "Invalid user credentials",
      });
    }

    // Generate refresh and access tokens
    const tokens = this.tokenUtil.getAccessAndRefreshTokens(
      {
        sub: user.id,
        role: user.role,
        jti: randomUUID() + Date.now(),
      },
      userData.remember
    );

    const {hashedRefreshToken, refreshToken, accessToken, expires_in} = tokens;

    // Create a session in db
    await this.authRepository.insertRefreshToken(
      {
        expires_in,
        user_id: user.id,
        client_info: clientInfo,
        replace_by_token_id: null,
        token_hash: hashedRefreshToken,
        remember_me: userData.remember,
      }
    );

    const {password: _, ...safeUser} = user;

    // Generate access and refresh options
    const accessOptions = this.tokenUtil.getCookieOptions('access');
    const refreshOptions = this.tokenUtil.getCookieOptions('refresh', userData.remember);

    // Set user cache
    void this.usersCacheService.setCacheUserInfo(safeUser);
    this.logger.info({userId: safeUser.id}, 'User logged in');

    const dashboardLink: string = this.config.get<string>("APPLICATION_DASHBOARD_URL") ?? "http://127.0.0.1:3000/dashboard";

    void this.authMail.authNotification(
      "login",
      safeUser.email,
      dashboardLink,
      clientInfo
    );

    return {
      accessToken,
      refreshToken,
      accessOptions,
      refreshOptions,
      user: safeUser,
    };
  }

  /**
   * Validate a refresh token against cache + DB.
   *
   * Fast path: if the user is cached, only the token record is fetched.
   * Slow path: if cache is cold, token + user are fetched together and
   * the user is cached back for subsequent calls.
   *
   * If the token is already revoked, all sessions for the user are
   * revoked (defense in depth) and a 401 with `clearAuthCookies` meta
   * is thrown so the client drops its cookies.
   *
   * @param userId - User id extracted from the refresh token (already verified by guard)
   * @param tokenHash - SHA-256 hash of the raw refresh token
   * @param tx - @type {DrizzleTransaction}
   * @returns Resolved refresh record + user
   * @throws {AppException} 401 REFRESH_TOKEN_EXPIRE — token not found or expired
   * @throws {AppException} 401 REFRESH_TOKEN_REVOKED — token was revoked (all sessions invalidated)
   */
  async validateRefresh({userId, tokenHash}: RefreshGuardData, tx?: DrizzleTransaction): Promise<RefreshTokenPayload> {
    // Get user from cache if exists.
    const userCached = await this.usersCacheService.getCachedUserInfo(userId);

    let tokenRecord: RefreshTokenPayload;

    // If user cache exists
    if (userCached) {
      // Get session/token from db
      const [findToken] = await this.authRepository.findRefreshRecord(tokenHash, tx);

      // If token not exists, Throw an exception
      if (!findToken) throw new AppException({
        statusCode: 401,
        code: 'REFRESH_TOKEN_EXPIRE',
        message: 'Invalid or expired refresh token',
      });

      // Else, complete token record object
      tokenRecord = {
        user: userCached,
        refreshRecord: findToken,
      };
    } else {
      // If user cache not exists, find user from db
      const [findToken] = await this.authRepository.findRefreshRecordWithUser(tokenHash, tx);

      // If token not exists, Throw an exception
      if (!findToken) throw new AppException({
        statusCode: 401,
        code: 'REFRESH_TOKEN_EXPIRE',
        message: 'Invalid or expired refresh token',
      });

      if (!findToken.user) {
        this.logger.warn({tokenHash}, 'Refresh token found but user does not exist');

        throw new AppException({
          statusCode: 401,
          code: 'USER_NOT_FOUND',
          message: 'User associated with this token no longer exists',
        });
      }

      // Cach user
      void this.usersCacheService.setCacheUserInfo(findToken.user);

      const {user, ...refreshRecord} = findToken;

      tokenRecord = {
        user,
        refreshRecord,
      };
    }

    // If this token is revoked
    if (tokenRecord.refreshRecord.is_revoked) {
      this.logger.warn({userId},
        'Refresh token reuse detected — all sessions revoked'
      );

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
   *
   * Performs token rotation in a single DB operation:
   * - Revoke the old refresh token
   * - Insert a new session with the new token hash
   *
   * The new access + refresh tokens are generated first, then persisted
   * via `rotateToken` (which must be atomic in the repository). Cookie
   * options are built after persistence so a failure there never leaves
   * an orphan token in the DB.
   *
   * @param refreshPayload - Validated payload from `validateRefresh` (user + old token record)
   * @param client_info - Normalized client info for the new session
   * @returns New access/refresh tokens + cookie options + user
   */
  async refresh({userId, tokenHash, client_info}: RefreshRequestService) {
    try {
      const result = await this.drizzle.db.transaction(
        async (tx) => {
          const refreshPayload = await this.validateRefresh({tokenHash, userId}, tx);

          const user = refreshPayload.user;
          const remember_me = refreshPayload.refreshRecord.remember_me;

          // Generate refresh and access tokens
          const tokens = this.tokenUtil.getAccessAndRefreshTokens(
            {
              sub: user.id,
              role: user.role,
              jti: v7(),
            },
            remember_me
          );

          const {hashedRefreshToken, refreshToken, accessToken, expires_in} = tokens;

          // Rotate token(revoke old token and insert new token in db)
          await this.authRepository.rotateToken(
            refreshPayload.refreshRecord.id,
            {
              expires_in,
              client_info,
              remember_me,
              user_id: user.id,
              replace_by_token_id: null,
              token_hash: hashedRefreshToken,
            },
            tx
          );

          return {
            user,
            remember_me,
            accessToken,
            refreshToken,
          };
        },
        {
          accessMode: 'read write',
          isolationLevel: 'read committed'
        }
      );

      // Generate access and refresh options
      const accessOptions = this.tokenUtil.getCookieOptions('access');
      const refreshOptions = this.tokenUtil.getCookieOptions('refresh', result.remember_me);

      return {
        accessOptions,
        refreshOptions,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };
    } catch (e) {
      if (e instanceof AppException) {
        const exp = (e as unknown as { error: unknown })?.error as AppErrorPayload;
        const code = exp?.code;

        if (code === 'REFRESH_TOKEN_REVOKED' || code === 'REFRESH_TOKEN_REUSE') {
          try {
            await this.authRepository.revokeAllUserTokens(userId);

          } catch (revokeErr: unknown) {
            this.logger.error(
              {userId, revokeErr, originalCode: code},
              'Failed to revoke all user tokens during refresh-token reuse handling'
            );
          }
        }
      }

      throw e;
    }
  }

  /**
   * **Logout user by revoking their refresh token**
   *
   * @param rawRefreshTokenId - Raw refresh token string (optional)
   *
   * @remarks
   * - If token is provided, it is hashed and revoked in the database
   * - This is a synchronous operation that does not wait for completion
   * - Browser cookies are cleared separately by the Gateway
   */
  logout(rawRefreshTokenId: string | null) {
    if (rawRefreshTokenId !== null) {
      const hashedRefreshToken = hashSecretToken(rawRefreshTokenId);
      void this.authRepository.revokeToken(hashedRefreshToken);
    }
  }

  /**
   * Changes the authenticated user's password.
   *
   * Verifies `oldPassword`, hashes `newPassword`, then atomically updates the
   * hash and revokes all user tokens in a single Drizzle transaction.
   * A confirmation email is sent (fire-and-forget) after the commit.
   *
   * @param data - `{ userId, oldPassword, newPassword, clientInfo }`
   * @returns Success message asking the user to log in again.
   * @throws {AppException} 404 `NotFound` — user does not exist.
   * @throws {AppException} 400 `Invalid Old Password` — `oldPassword` mismatch.
   * @throws {AppException} 500 — hashing or DB transaction failure.
   */
  async changePassword(data: ChangePasswordRequestService) {
    // Make a drizzle transaction for change and revoke all user sessions
    const result = await this.drizzle.db.transaction(
      async (tx) => {
        const user = await this.usersRepository.findOne({id: data.userId}, false, tx);

        if (!user) throwNotFound('User', 'id');

        // Check user password
        const isValidPassword = await compareSecret(data.oldPassword, user.password);

        // Throw exception if old password is invalid
        if (!isValidPassword) {
          this.logger.warn(
            {userId: user.id},
            'Password change failed: old password does not match'
          );

          throw new AppException({
            statusCode: 400,
            code: 'Invalid Old Password',
            message: 'The current password you entered is incorrect.',
          });
        }

        // Hash password
        const hashedPassword = await hashSecret(data.newPassword);

        await this.authRepository.changePassword({id: user.id, password: hashedPassword}, tx);
        await this.authRepository.revokeAllUserTokens(user.id, tx);

        // Return the value FROM the transaction (will be available after commit)
        return {
          email: user.email,
          message: 'Your password changed successfully. Please login again to your account.'
        };
      },
      {
        isolationLevel: 'read committed'
      }
    );

    // Send email After successful commit
    void this.authMail.passwordChangedNotification(result.email, data.clientInfo, 'change');

    return result.message;
  }

  /**
   * **Initiates the password reset process.**
   *
   * @remarks
   * - This method is **public** and does not require authentication.
   * - To prevent **email enumeration attacks**, the same success message is returned
   *   regardless of whether the email exists in the system.
   * - The reset link contains a single-use token that expires after **15 minutes**.
   * - Email sending is **fire-and-forget** (non-blocking) to keep the response fast.
   *
   * @param email - The user's registered email address.
   * @param clientInfo - Client metadata (IP, browser, OS, etc.) for the security email.
   * @returns A generic success message to avoid revealing whether the email exists.
   *
   * @example
   * await this.forgotPassword('user@example.com', clientInfo);
   * // Returns: "If an account with that email exists, a password reset link has been sent."
   */
  async forgotPassword(
    email: string,
    clientInfo: NormalizeClientInfoType,
  ): Promise<string> {
    const genericMessage = "If an account with that email exists, a password reset link has been sent.";

    const user = await this.usersRepository.findOne({email});

    // Return a generic message even if the user does not exist (security).
    if (!user) return genericMessage;

    const rawToken = await this.tokenUtil.setPwdToken({email, id: user.id});

    if (rawToken) {
      void this.authMail.forgotPasswordNotification(
        user.email,
        rawToken,
        clientInfo,
        15, // Token expires after 15 minutes.
      );
    }

    return genericMessage;
  }

  /**
   * Resets the user's password using a valid reset token.
   *
   * @remarks
   * - The token is verified and **consumed** by `verifyPwdToken` (single-use).
   *   An invalid, expired, or already-used token results in a `400`.
   * - The password update and **all** refresh-token revocations are executed
   *   inside a single database **transaction** (`drizzle.db.transaction`),
   *   ensuring the user is never left with a new password but stale sessions.
   * - The reset token's per-user lock (`pwd_reset:user:<id>`) is **not**
   *   released here; it expires on its own TTL (15 min).
   * - A "password changed" security-alert email is sent **after** the
   *   transaction commits (fire-and-forget; delivery failures are logged,
   *   not thrown).
   *
   * @param token       - Raw reset token from the email link.
   * @param newPassword - New password (validated upstream by Zod).
   * @param clientInfo  - Client metadata attached to the security-alert email.
   * @returns Success message.
   *
   * @throws {AppException} 400 — `INVALID_RESET_TOKEN` if the token is
   *   invalid, expired, or already used.
   * @throws {AppException} — propagated from `handleDrizzleError` on DB failure.
   *
   * @example
   * await this.resetPassword({
   *   token: rawToken,
   *   newPassword: "n3w-S3cret!",
   *   clientInfo,
   * });
   */
  async resetPassword({token, newPassword, clientInfo}: ResetPasswordRequestService) {
    const cached = await this.tokenUtil.verifyPwdToken(token);

    if (!cached) throw new AppException({
      statusCode: 400,
      code: "INVALID_RESET_TOKEN",
      message: "The reset token is invalid or has expired. Please request a new one.",
    });

    try {
      // Hash password and change
      const hashedPassword = await hashSecret(newPassword);

      await this.drizzle.db.transaction(async (tx) => {
        await this.authRepository.changePassword({id: cached.id, password: hashedPassword}, tx);
        await this.authRepository.revokeAllUserTokens(cached.id, tx);
      });
    } catch (e) {
      handleDrizzleError({
        e: e as Error,
        conflictField: '',
        mainResource: 'user',
        notFoundField: 'id',
        notFoundResource: 'user',
      });
    }

    // Notification to user
    void this.authMail.passwordChangedNotification(cached.email, clientInfo, 'reset');

    return 'User password reset successfully.';
  }
}
