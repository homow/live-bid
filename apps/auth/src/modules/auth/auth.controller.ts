import {Controller} from "@nestjs/common";
import {AuthService} from "./auth.service";
import * as Schemas from "@live-bid/contracts/schemas";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as Messages from "@live-bid/services/graphql-messages";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(Messages.AUTH_MESSAGES.REGISTER)
  register(
    @Payload() input: Schemas.RegisterUserSchemaType
  ) {
    return this.authService.register(input);
  }
}
