import {Module} from "@nestjs/common";
import * as Services from "./services";
import {UsersRepository} from "./users.repository";
import {UsersController} from "./users.controller";

@Module({
  controllers: [
    UsersController
  ],
  providers: [
    UsersRepository,
    Services.UsersService,
    Services.UsersCacheService,
  ],
  exports: [
    UsersRepository,
    Services.UsersService,
    Services.UsersCacheService,
  ]
})
export class UsersModule {}
