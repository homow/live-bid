import {Module} from "@nestjs/common";
import * as Services from "./services";
import {UserRepository} from "./user.repository";
import {UserController} from "./user.controller";

@Module({
  controllers: [
    UserController
  ],
  providers: [
    UserRepository,
    Services.UserService,
    Services.UserCacheService,
  ],
  exports: [
    UserRepository,
    Services.UserService,
    Services.UserCacheService,
  ]
})
export class UserModule {}
