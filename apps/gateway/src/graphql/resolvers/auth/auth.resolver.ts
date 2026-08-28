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

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

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

    res.cookie(ACCESS_TOKEN_NAME, accessToken, accessOptions);
    res.cookie(REFRESH_TOKEN_NAME, refreshToken, refreshOptions);

    return user;
  }
}
