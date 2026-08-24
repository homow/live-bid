import {PinoLogger} from "nestjs-pino";
import {compareSecret, hashSecret} from "@app/auth/lib";
import {Injectable} from "@nestjs/common";
import {AuthRepository} from "./auth.repository";
import * as Schemas from "@live-bid/contracts/schemas";
import {NormalizeClientInfoType} from "@live-bid/services/types";
import {UserRepository} from "@app/auth/modules/user/user.repository";
import {AppException} from "@live-bid/services/lib";

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

  async login(userData: Schemas.LoginUserSchemaType, clientInfo: NormalizeClientInfoType) {
    const user = await this.userRepository.findOne(
      {
        email: userData.email,
        username: userData.username,
      },
      false
    );

    if (!user) throw new AppException({
      statusCode: 404,
      code: "User not found",
      message: "User does not exist in database, please check phone and try again",
    });

    const isValidPassword = await compareSecret(userData.password, user.password);

    if (!isValidPassword) throw new AppException({
      statusCode: 401,
      code: 'Invalid Credentials',
      message: "Invalid user credentials",
    });
  }
}
