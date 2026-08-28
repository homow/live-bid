import {Controller} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as ServiceMessages from "@live-bid/services/messages";
import type {
  LoginRequestService,
  LoginResponseService,
  RefreshRequestService,
  RefreshTokenPayload,
  RegisterResponseService,
  ValidateRefreshRequestService
} from "@live-bid/services/types";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REGISTER)
  register(
    @Payload() input: ZodSchemas.RegisterUserSchemaType
  ): Promise<RegisterResponseService> {
    return this.authService.register(input);
  }

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.LOGIN)
  login(
    @Payload() input: LoginRequestService,
  ): Promise<LoginResponseService> {
    return this.authService.login(input.userData, input.clientInfo);
  }

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN)
  validateRefreshToken(
    @Payload() input: ValidateRefreshRequestService,
  ): Promise<RefreshTokenPayload> {
    return this.authService.validateRefresh(input);
  }

  @MessagePattern(ServiceMessages.AUTH_PATTERNS.REFRESH)
  refresh(data: RefreshRequestService) {
    return this.authService.refresh(data);
  }
}
