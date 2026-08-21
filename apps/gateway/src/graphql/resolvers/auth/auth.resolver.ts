import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import * as AuthInputs from "./inputs";
import * as AuthOutputs from "./outputs";
import {ZodPipe} from "@app/gateway/common";
import {ClientProxy} from "@nestjs/microservices";
import * as Schemas from "@live-bid/contracts/schemas";
import {Resolver, Mutation, Args} from "@nestjs/graphql";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as Messages from "@live-bid/services/graphql-messages";

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
}
