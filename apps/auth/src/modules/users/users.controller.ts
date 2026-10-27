import {UsersService} from "./services";
import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as ServiceMessages from "@live-bid/services/messages";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(ServiceMessages.USERS_PATTERNS.PUBLIC_PROFILE)
  getPublicProfile(
    @Payload() userId: string
  ) {
    console.log(userId);
    return "publicProfile";
  }
}
