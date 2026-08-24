import {AuthUtil} from "./utils";
import {PinoLogger} from "nestjs-pino";
import {randomUUID} from "node:crypto";
import {Injectable} from "@nestjs/common";
import {AuthRepository} from "./auth.repository";
import {AppException} from "@live-bid/services/lib";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {compareSecret, hashSecret} from "@app/auth/lib";
import {NormalizeClientInfoType} from "@live-bid/services/types";
import {UserRepository} from "@app/auth/modules/user/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly authUtil: AuthUtil,
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /** **Register User** */
  async register(userData: ZodSchemas.RegisterUserSchemaType) {
    const hashedPassword: string = await hashSecret(userData.password);

    const user = await this.userRepository.insertUser({
      ...userData,
      password: hashedPassword,
    });

    this.logger.info(
      {userId: user.id, display_name: user.display_name},
      "User registered successfully",
    );

    return user;
  }

  async login(userData: ZodSchemas.LoginUserSchemaType, clientInfo: NormalizeClientInfoType) {
    // Find user in database with password
    const user = await this.userRepository.findOne(
      {
        email: userData.email,
        username: userData.username,
      },
      false
    );

    // Throw exception if user doesn't in database
    if (!user) throw new AppException({
      statusCode: 404,
      code: "User not found",
      message: "User does not exist in database, please check phone and try again",
    });

    // Check password
    const isValidPassword = await compareSecret(userData.password, user.password);

    // Throw exception if password is invalid
    if (!isValidPassword) {
      this.logger.warn({id: user.id}, 'Login failed: invalid credentials');

      throw new AppException({
        statusCode: 401,
        code: 'Invalid Credentials',
        message: "Invalid user credentials",
      });
    }

    const tokens = this.authUtil.getTokens(
      {
        sub: user.id,
        role: user.role,
        jti: randomUUID() + Date.now(),
        display_name: user.display_name,
      },
      userData.remember
    );

    const {hashedRefreshToken, refreshToken, accessToken, expires_at} = tokens;

    await this.authRepository.insertRefreshToken({
      user_id: user.id,
      expires_in: expires_at,
      client_info: clientInfo,
      replace_by_token_id: null,
      token_hash: hashedRefreshToken,
    });

    this.logger.info({userId: user.id}, 'User logged in');

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
