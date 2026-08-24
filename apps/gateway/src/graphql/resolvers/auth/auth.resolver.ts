import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import * as AuthInputs from "./inputs";
import * as AuthOutputs from "./outputs";
import {ClientProxy} from "@nestjs/microservices";
import type {GraphQLContext} from "@app/gateway/types";
import * as ZodSchemas from "@live-bid/contracts/schemas";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {NormalizeClientInfo, ZodPipe} from "@app/gateway/common";
import {Resolver, Mutation, Args, Context} from "@nestjs/graphql";
import type {LoginRequest, NormalizeClientInfoType} from "@live-bid/services/types";
import * as GraphqlMessages from "@live-bid/services/graphql-messages";

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @Mutation(() => AuthOutputs.RegisterUserOutput)
  register(
    @Args(
      "input",
      {type: () => AuthInputs.RegisterUserInput},
      new ZodPipe(ZodSchemas.RegisterUserSchema)
    )
    input: ZodSchemas.RegisterUserSchemaType
  ): Promise<AuthOutputs.RegisterUserOutput> {
    return firstValueFrom(this.authClient.send(GraphqlMessages.AUTH_MESSAGES.REGISTER, input));
  }

  @Mutation(() => String)
  login(
    @Args(
      "input",
      {type: () => AuthInputs.LoginUserInput},
      new ZodPipe(ZodSchemas.LoginUserSchema)
    ) input: ZodSchemas.LoginUserSchemaType,
    @Context() context: GraphQLContext,
    @NormalizeClientInfo() clientInfo: NormalizeClientInfoType
  ) {
    return firstValueFrom(this.authClient.send(GraphqlMessages.AUTH_MESSAGES.LOGIN, {
      clientInfo,
      userData: input
    } satisfies LoginRequest));
  }
}
