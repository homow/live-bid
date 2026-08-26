import {Module} from "@nestjs/common";
import * as UserServices from "./services";
import {UserRepository} from "./user.repository";
import {UserController} from "./user.controller";

@Module({
  controllers: [
    UserController
  ],
  providers: [
    UserRepository,
    UserServices.UserService,
    UserServices.UserCacheService,
  ],
  exports: [
    UserRepository,
    UserServices.UserService,
    UserServices.UserCacheService,
  ]
})
export class UserModule {}
