import {Controller} from "@nestjs/common";
import * as Schemas from "@live-bid/contracts/schemas";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as Messages from "@live-bid/services/graphql-messages";

@Controller()
export class AuthController {
  @MessagePattern(Messages.AUTH_MESSAGES.REGISTER)
  register(
    @Payload() input: Schemas.RegisterUserSchemaType
  ) {
    return "register successfully.";
  }
}
