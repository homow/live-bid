import {Controller} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as GraphqlMessages from "@live-bid/services/graphql-messages";
import type {LoginRequest, LoginResponse, RegisterResponse} from "@live-bid/services/types";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(GraphqlMessages.AUTH_MESSAGES.REGISTER)
  register(
    @Payload() input: ZodSchemas.RegisterUserSchemaType
  ): Promise<RegisterResponse> {
    return this.authService.register(input);
  }

  @MessagePattern(GraphqlMessages.AUTH_MESSAGES.LOGIN)
  login(
    @Payload() input: LoginRequest,
  ): Promise<LoginResponse> {
    return this.authService.login(input.userData, input.clientInfo);
  }
}
