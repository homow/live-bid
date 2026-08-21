import {PinoLogger} from "nestjs-pino";
import {hashSecret} from "@app/auth/lib";
import {Injectable} from "@nestjs/common";
import {AuthRepository} from "./auth.repository";
import * as Schemas from "@live-bid/contracts/schemas";
import {UserRepository} from "@app/auth/modules/user/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /** **Register User** */
  async register(userData: Schemas.RegisterUserSchemaType) {
    const hashedPassword: string = await hashSecret(userData.password);

    const user = await this.userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    this.logger.info(
      {userId: user.id, display_name: user.display_name},
      "User registered successfully",
    );

    return user;
  }
}
