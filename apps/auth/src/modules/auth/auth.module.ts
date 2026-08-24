import {AuthUtil} from "./utils";
import {Module} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthRepository} from "./auth.repository";
import {AuthController} from "./auth.controller";
import {UserModule} from "@app/auth/modules/user";

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthUtil,
    AuthService,
    AuthRepository,
  ],
})
export class AuthModule {}
