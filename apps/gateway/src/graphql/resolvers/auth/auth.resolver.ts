import {firstValueFrom} from "rxjs";
import {ClientProxy} from "@nestjs/microservices";
import {Inject} from "@nestjs/common";
import {Resolver, Mutation, Args} from "@nestjs/graphql";
import * as Messages from "@live-bid/services/graphql-messages";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as AuthInputs from "./inputs";
import * as AuthSchemas from "@live-bid/contracts/schemas/auth";
import {ZodPipe} from "@app/gateway/common";

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @Mutation(() => String)
  register(
    @Args(
      "input",
      {type: () => AuthInputs.RegisterUserInput},
      new ZodPipe(AuthSchemas.RegisterUserSchema)
    )
    input: AuthSchemas.RegisterUserSchemaType
  ) {
    console.log(input);
    return firstValueFrom(this.authClient.send(Messages.AUTH_MESSAGES.REGISTER, {}));
  }
}
