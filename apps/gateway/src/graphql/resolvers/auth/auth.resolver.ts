import {firstValueFrom} from "rxjs";
import {ClientProxy} from "@nestjs/microservices";
import {Inject} from "@nestjs/common";
import {Resolver, Mutation, Args, Query} from "@nestjs/graphql";
import * as Messages from "@live-bid/services/graphql-messages";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as AuthInputs from "./inputs";
import * as Schemas from "@live-bid/contracts/schemas";
import {ZodPipe} from "@app/gateway/common";

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
