import type {
  LoginRequestService,
  LoginResponseService,
  LogoutRequestService,
  RefreshRequestService,
  RegisterRequestService,
  RegisterResponseService,
  ResetPasswordRequestService,
  ChangePasswordRequestService,
  ForgotPasswordRequestService,
} from "@live-bid/services/types";

import {Controller} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as ServiceMessages from "@live-bid/services/messages";

/**
 * **AuthController**
 *
 * Handles incoming microservice messages for authentication operations.
 * All methods are message handlers that delegate business logic to `AuthService`.
 *
 * @remarks
 * - Uses Redis transport for inter-service communication
 * - Input validation is performed by Zod schemas before reaching this layer
 * - All responses are typed with service-specific response types
 */
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * **Register a new user**
   *
   *
   * @returns The created user record without sensitive fields
   * @param data
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REGISTER)
  register(
    @Payload() data: RegisterRequestService
  ): Promise<RegisterResponseService> {
    return this.authService.register(data.input, data.clientInfo);
  }

  /**
   * **Authenticate user and generate tokens**
   *
   *
   * @returns User data + access/refresh tokens with cookie options
   * @param data
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.LOGIN)
  login(
    @Payload() data: LoginRequestService,
  ): Promise<LoginResponseService> {
    return this.authService.login(data.userData, data.clientInfo);
  }

  /**
   * **Rotate refresh token**
   *
   *
   * @returns New access/refresh tokens with cookie options
   * @param data
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REFRESH)
  refresh(
    @Payload() data: RefreshRequestService,
  ): Promise<LoginResponseService> {
    return this.authService.refresh(data);
  }

  /**
   * **Revoke refresh token on logout**
   *
   * @param data - Raw refresh token ID to be revoked
   *
   * @remarks
   * - This is a fire-and-forget handler (void return)
   * - Token is hashed and marked as revoked in the database
   * - No response is expected from the client side
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.LOGOUT)
  logout(
    @Payload() data: LogoutRequestService,
  ) {
    this.authService.logout(data.rawRefreshTokenId);
  }

  /**
   * Microservice handler for `AUTH_PATTERNS.changePassword`.
   *
   * Thin transport layer: receives the payload from `AuthClient` and delegates
   * to `AuthService.changePassword`. All errors (404, 400, 500) propagate
   * back to the caller unchanged.
   *
   * @param data - `{ userId, oldPassword, newPassword, clientInfo }`
   * @returns Success message asking the user to log in again.
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.CHANGE_PASSWORD)
  changePassword(
    @Payload() data: ChangePasswordRequestService,
  ) {
    return this.authService.changePassword(data);
  }

  /**
   * **Handle forgot-password requests from the API Gateway.**
   *
   * Receives a message via the microservice transport layer and delegates
   * the reset process to `AuthService.forgotPassword`.
   *
   * @param data - Contains the user's `email` and normalized `clientInfo`.
   * @returns A generic success message (prevents email enumeration).
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.FORGOT_PASSWORD)
  forgotPassword(
    @Payload() data: ForgotPasswordRequestService
  ) {
    return this.authService.forgotPassword(data.email, data.clientInfo);
  }

  /**
   * **Handle reset-password requests from the API Gateway.**
   *
   * Receives a message via the microservice transport layer and delegates
   * the password reset to `AuthService.resetPassword`.
   *
   * @param data - Contains the reset `token`, `newPassword`, and `clientInfo`.
   * @returns A success message from the auth service.
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.RESET_PASSWORD)
  resetPassword(
    @Payload() data: ResetPasswordRequestService
  ) {
    return this.authService.resetPassword(data);
  }
}
