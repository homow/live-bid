import * as Utils from "./utils";
import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import * as Services from "./services";
import {AuthRepository} from "./auth.repository";
import {AuthController} from "./auth.controller";
import {UsersModule} from "@app/auth/modules/users";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthRepository,
    Utils.TokenUtil,
    Services.AuthService,
  ],
})
export class AuthModule {}
