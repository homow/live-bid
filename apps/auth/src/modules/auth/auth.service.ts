import {hashSecret} from "@app/auth/lib";
import {Injectable} from "@nestjs/common";
import {AuthRepository} from "./auth.repository";
import * as Schemas from "@live-bid/contracts/schemas";
import {UserRepository} from "@app/auth/modules/user/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /** **Register User** */
  async register(userData: Schemas.RegisterUserSchemaType) {
    const hashedPassword: string = await hashSecret(userData.password);

    return this.userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });
  }
}
