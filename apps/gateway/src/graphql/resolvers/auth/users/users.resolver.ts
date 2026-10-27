import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import {ZodPipe} from "@app/gateway/common";
import * as UsersDecorator from "./decorators";
import {ClientProxy} from "@nestjs/microservices";
import {UUIDv7Schema} from "@live-bid/contracts/schemas";
import {Args, ID, Query, Resolver} from "@nestjs/graphql";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as ServiceMessages from "@live-bid/services/messages";
import type {PublicProfileResponseService} from "@live-bid/services/types";

@Resolver()
export class UserResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @UsersDecorator.getUsersProfile()
  @Query(() => String, {name: 'publicProfile'})
  async publicProfile(
    @Args(
      'userId', {type: () => ID},
      new ZodPipe(UUIDv7Schema)
    ) userId: string
  ) {
    const result = await firstValueFrom<PublicProfileResponseService>(
      this.authClient.send(
        ServiceMessages.USERS_PATTERNS.PUBLIC_PROFILE,
        userId
      )
    );
    console.log(result);
    return 'user profile';
  }
}
