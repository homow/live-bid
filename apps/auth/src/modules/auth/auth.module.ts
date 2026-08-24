import {TokenUtil} from "./utils";
import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {AuthService} from "./auth.service";
import {PassportModule} from "@nestjs/passport";
import {AuthRepository} from "./auth.repository";
import {AuthController} from "./auth.controller";
import {UserModule} from "@app/auth/modules/user";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    TokenUtil,
    AuthService,
    AuthRepository,
  ],
})
export class AuthModule {}
