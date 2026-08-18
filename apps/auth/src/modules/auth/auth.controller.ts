import {Controller} from "@nestjs/common";
import {MessagePattern} from "@nestjs/microservices";
import * as Messages from "@live-bid/contracts/services/patterns/messages";

@Controller('auth')
export class AuthController {
  @MessagePattern(Messages.AUTH_MESSAGES.REGISTER)
  register() {
    return "register successfully.";
  }
}
