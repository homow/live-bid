import {firstValueFrom} from "rxjs";
import * as Outputs from "./outputs";
import {Inject} from "@nestjs/common";
import {ZodPipe} from "@app/gateway/common";
import * as UsersDecorator from "./decorators";
import {ClientProxy} from "@nestjs/microservices";
import {UUIDv7Schema} from "@live-bid/contracts/schemas";
import {Args, ID, Query, Resolver} from "@nestjs/graphql";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import * as ServiceMessages from "@live-bid/services/messages";
import type {PublicProfileResponseService} from "@live-bid/services/types";

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
  @UsersDecorator.getUsersProfile()
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
}
