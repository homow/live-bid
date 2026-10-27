import {Inject} from "@nestjs/common";
import * as UsersDecorator from "./decorators";
import {Query, Resolver} from "@nestjs/graphql";
import {ClientProxy} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";

@Resolver()
export class UserResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @UsersDecorator.getUsersProfile()
  @Query(() => String, {name: 'publicProfile'})
  publicProfile() {
    return 'user profile';
  }
}
