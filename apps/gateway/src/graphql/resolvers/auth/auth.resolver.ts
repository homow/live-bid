import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import * as AuthInputs from "./inputs";
import * as AuthOutputs from "./outputs";
import {ClientProxy} from "@nestjs/microservices";
import type {GraphQLContext} from "@app/gateway/types";
import * as Schemas from "@live-bid/contracts/schemas";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as Messages from "@live-bid/services/graphql-messages";
import {NormalizeClientInfo, ZodPipe} from "@app/gateway/common";
import {Resolver, Mutation, Args, Context} from "@nestjs/graphql";
import type {NormalizeClientInfoType} from "@live-bid/services/types";

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
      new ZodPipe(Schemas.RegisterUserSchema)
    )
    input: Schemas.RegisterUserSchemaType
  ): Promise<AuthOutputs.RegisterUserOutput> {
    return firstValueFrom(this.authClient.send(Messages.AUTH_MESSAGES.REGISTER, input));
  }

  @Mutation(() => String)
  login(
    @Args(
      "input",
      {type: () => AuthInputs.LoginUserInput},
      new ZodPipe(Schemas.LoginUserSchema)
    ) input: Schemas.LoginUserSchemaType,
    @Context() context: GraphQLContext,
    @NormalizeClientInfo() clientInfo: NormalizeClientInfoType
  ) {
    return "login";
  }
}
