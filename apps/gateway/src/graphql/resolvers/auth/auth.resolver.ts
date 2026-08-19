import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import * as AuthInputs from "./inputs";
import {ZodPipe} from "@app/gateway/common";
import {ClientProxy} from "@nestjs/microservices";
import * as Schemas from "@live-bid/contracts/schemas";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as Messages from "@live-bid/services/graphql-messages";
import {Resolver, Mutation, Args, Query} from "@nestjs/graphql";

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @Query(() => String)
  hello() {
    return "Hello from GraphQL!";
  }

  @Mutation(() => String)
  register(
    @Args(
      "input",
      {type: () => AuthInputs.RegisterUserInput},
      new ZodPipe(Schemas.RegisterUserSchema)
    )
    input: Schemas.RegisterUserSchemaType
  ) {
    console.log(input);
    return firstValueFrom(this.authClient.send(Messages.AUTH_MESSAGES.REGISTER, {}));
  }
}
