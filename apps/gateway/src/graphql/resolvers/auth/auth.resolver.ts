import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import * as AuthInputs from "./inputs";
import * as AuthOutputs from "./outputs";
import * as Decorators from "./decorators";
import {ClientProxy} from "@nestjs/microservices";
import type {GraphQLContext} from "@app/gateway/types";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import * as ServiceMessages from "@live-bid/services/messages";
import {Resolver, Mutation, Args, Context} from "@nestjs/graphql";
import {NormalizeClientInfo, ZodPipe} from "@app/gateway/common";
import {ACCESS_TOKEN_NAME, AUTH_SERVICE_NAME, REFRESH_TOKEN_NAME} from "@live-bid/services/names";
import type {LoginRequest, LoginResponse, NormalizeClientInfoType, RegisterResponse} from "@live-bid/services/types";

/**
 * **AuthResolver**
 *
 * Handles authentication operations for the GraphQL API.
 * This resolver communicates with the Auth microservice via the `ClientProxy` transport layer.
 *
 * @remarks
 * - All mutations are decorated with custom security decorators (RegisterDecorators, LoginDecorators)
 * - Input validation is performed using ZodPipe with predefined schemas
 * - Authentication tokens are set as HTTP-only cookies on login
 *
 * @example
 * // In your GraphQL client:
 * mutation Register {
 *   register(input: { email: "test@example.com", username: "john", password: "secret" }) {
 *     id
 *     email
 *   }
 * }
 *
 * mutation Login {
 *   login(input: { email: "test@example.com", password: "secret" }) {
 *     id
 *     email
 *     role
 *   }
 * }
 */
@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  /**
   * **Register a new user**
   *
   * @param input - Registration data (email, username, password)
   *
   * @returns RegisterResponse - Contains user info and status
   *
   * @example
   * mutation {
   *   register(input: { email: "user@example.com", username: "john", password: "secret" }) {
   *     id
   *     email
   *   }
   * }
   */
  @Decorators.RegisterDecorators()
  @Mutation(() => AuthOutputs.RegisterUserOutput)
  register(
    @Args(
      "input",
      {type: () => AuthInputs.RegisterUserInput},
      new ZodPipe(ZodSchemas.RegisterUserSchema)
    )
    input: ZodSchemas.RegisterUserSchemaType
  ) {
    return firstValueFrom<RegisterResponse>(
      this.authClient.send(
        ServiceMessages.AUTH_PATTERNS.REGISTER,
        input satisfies ZodSchemas.RegisterUserSchemaType
      )
    );
  }

  /**
   * **Login user with email/username and password**
   *
   * @param input - Login credentials (email or username + password)
   * @param context - GraphQL context containing the response object
   * @param clientInfo - Client metadata (IP, User-Agent, Geo, Lang)
   *
   * @returns LoginResponse - User data and sets HTTP-only cookies
   *
   * @remarks
   * - Access and refresh tokens are automatically set as HTTP-only cookies
   * - Cookies are secure, httpOnly, and have expiration based on server config
   *
   * @example
   * mutation {
   *   login(input: { email: "user@example.com", password: "secret" }) {
   *     id
   *     email
   *     role
   *   }
   * }
   */
  @Decorators.LoginDecorators()
  @Mutation(() => AuthOutputs.LoginUserOutput)
  async login(
    @Args(
      "input",
      {type: () => AuthInputs.LoginUserInput},
      new ZodPipe(ZodSchemas.LoginUserSchema)
    ) input: ZodSchemas.LoginUserSchemaType,
    @Context() context: GraphQLContext,
    @NormalizeClientInfo() clientInfo: NormalizeClientInfoType
  ) {
    const result = await firstValueFrom<LoginResponse>(
      this.authClient.send(
        ServiceMessages.AUTH_PATTERNS.LOGIN,
        {
          clientInfo,
          userData: input
        } satisfies LoginRequest
      )
    );

    const {res} = context;
    const {user, accessToken, refreshToken, accessOptions, refreshOptions} = result;

    // Set tokens in cookies
    res.cookie(ACCESS_TOKEN_NAME, accessToken, accessOptions);
    res.cookie(REFRESH_TOKEN_NAME, refreshToken, refreshOptions);

    return user;
  }
}
