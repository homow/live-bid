import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import {Resolver, Query} from "@nestjs/graphql";
import {ClientProxy} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/contracts/services/names";
import * as Messages from "@live-bid/contracts/services/patterns/messages";

@Resolver()
export class AppResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @Query(() => String)
  register() {
    return firstValueFrom(this.authClient.send(Messages.AUTH_MESSAGES, {}));
  }
}
