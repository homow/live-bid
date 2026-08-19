import {Module} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthRepository} from "./auth.repository";
import {AuthController} from "./auth.controller";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository
  ],
})
export class AuthModule {}
