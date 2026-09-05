import * as Utils from "./utils";
import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import * as Services from "./services";
import {AuthRepository} from "./auth.repository";
import {AuthController} from "./auth.controller";
import {UserModule} from "@app/auth/modules/user";

@Module({
  imports: [
    UserModule,
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
