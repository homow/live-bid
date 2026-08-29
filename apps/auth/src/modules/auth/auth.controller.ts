import type {
  RefreshTokenPayload,
  LoginRequestService,
  LoginResponseService,
  RefreshRequestService,
  RegisterResponseService,
  ValidateRefreshRequestService
} from "@live-bid/services/types";

import {Controller} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import * as ZodSchemas from "@live-bid/contracts/schemas";
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
   * @param input - Validated registration data (email, username, password)
   *
   * @returns The created user record without sensitive fields
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REGISTER)
  register(
    @Payload() input: ZodSchemas.RegisterUserSchemaType
  ): Promise<RegisterResponseService> {
    return this.authService.register(input);
  }

  /**
   * **Authenticate user and generate tokens**
   *
   * @param input - Login credentials and client metadata
   *
   * @returns User data + access/refresh tokens with cookie options
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.LOGIN)
  login(
    @Payload() input: LoginRequestService,
  ): Promise<LoginResponseService> {
    return this.authService.login(input.userData, input.clientInfo);
  }

  /**
   * **Validate refresh token**
   *
   * @param input - User ID and hashed refresh token
   *
   * @returns Validated token record with associated user data
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN)
  validateRefreshToken(
    @Payload() input: ValidateRefreshRequestService,
  ): Promise<RefreshTokenPayload> {
    return this.authService.validateRefresh(input);
  }

  /**
   * **Rotate refresh token**
   *
   * @param data - Current refresh payload and updated client info
   *
   * @returns New access/refresh tokens with cookie options
   */
  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REFRESH)
  refresh(data: RefreshRequestService): Promise<LoginResponseService> {
    return this.authService.refresh(data);
  }
}
