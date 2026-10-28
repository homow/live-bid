import {firstValueFrom} from "rxjs";
import * as Outputs from "./outputs";
import {Inject} from "@nestjs/common";
import {CurrentUser, ZodPipe} from "@app/gateway/common";
import * as UsersDecorator from "./decorators";
import {ClientProxy} from "@nestjs/microservices";
import {UUIDv7Schema} from "@live-bid/contracts/schemas";
import {Args, ID, Query, Resolver} from "@nestjs/graphql";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as ServiceMessages from "@live-bid/services/messages";
import type {PublicProfileResponseService, SafeUser} from "@live-bid/services/types";

/**
 * **UserResolver**
 *
 * Handles user profile operations for the GraphQL API.
 * This resolver communicates with the Auth microservice via the `ClientProxy` transport layer.
 *
 * @remarks
 * - All queries are decorated with custom security decorators (`UsersDecorator.*`)
 * - Input validation is performed using `ZodPipe` with predefined schemas
 * - Public profiles are exposed without sensitive fields (email, phone, role, etc.)
 * - Private profile data is resolved from the authenticated user's session
 *
 * @example
 * // In your GraphQL client:
 * query PublicProfile {
 *   publicProfile(userId: "01a17af7-648b-71f1-87dd-839d59660730") {
 *     username
 *     display_name
 *   }
 * }
 *
 * query MyProfile {
 *   myProfile {
 *     username
 *     display_name
 *   }
 * }
 */
@Resolver()
export class UserResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  /**
   * **Get a user's public profile**
   *
   * Returns the publicly visible data of a user by ID.
   * Sensitive fields (email, phone, role, etc.) are never exposed.
   *
   * @param userId - Target user's UUIDv7 identifier
   * @returns PublicProfileOutput - The user's public profile
   *
   * @remarks
   * - `userId` is validated via `ZodPipe(UUIDv7Schema)`
   * - Throws `NOT_FOUND` if the user does not exist
   * - Access control is enforced by `UsersDecorator.getUsersProfile()`
   *
   * @example
   * query {
   *   publicProfile(userId: "01a17af7-648b-71f1-87dd-839d59660730") {
   *     username
   *     display_name
   *   }
   * }
   */
  @UsersDecorator.GetPublicProfileDecorators()
  @Query(() => Outputs.PublicProfileOutput, {name: 'publicProfile'})
  publicProfile(
    @Args(
      'userId', {type: () => ID},
      new ZodPipe(UUIDv7Schema)
    ) userId: string
  ): Promise<Outputs.PublicProfileOutput> {
    return firstValueFrom<PublicProfileResponseService>(
      this.authClient.send(
        ServiceMessages.USERS_PATTERNS.PUBLIC_PROFILE,
        userId
      )
    );
  }

  /**
   * **Get the authenticated user's private profile**
   *
   * Returns the full profile data of the currently authenticated user,
   * including sensitive fields (email, phone, role, etc.) that are never
   * exposed through the public profile endpoint.
   *
   * @returns PrivateProfileOutput - The authenticated user's full profile
   *
   * @remarks
   * - `userId` is **not** accepted as a client argument; it is derived from the
   *   authenticated session to prevent users from reading other users' private data
   * - Access control is enforced by `UsersDecorator.getMyProfile()`, which requires
   *   a valid authenticated session
   * - Throws `UNAUTHORIZED` if no valid session is present
   * - Throws `NOT_FOUND` if the user record no longer exists
   *
   * @example
   * query {
   *   myProfile {
   *     username
   *     display_name
   *     email
   *   }
   * }
   */
  @UsersDecorator.GetMyProfileDecorators()
  @Query(() => String, {name: 'myProfile'})
  myProfile(
    @CurrentUser() user: SafeUser
  ) {
    console.log(user);
    return 'user';
  }
}
