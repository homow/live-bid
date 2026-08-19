import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import {Resolver, Query} from "@nestjs/graphql";
import {ClientProxy} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as Messages from "@live-bid/services/graphql-messages";

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @Query(() => String)
  register() {
    return firstValueFrom(this.authClient.send(Messages.AUTH_MESSAGES.REGISTER, {}));
  }
}
