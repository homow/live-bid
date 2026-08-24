import {TokenUtil} from "./utils";
import {JwtModule} from "@nestjs/jwt";
import {Module} from "@nestjs/common";
import {AccessStrategy} from "./strategy";
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
    AccessStrategy,
  ],
})
export class AuthModule {}
