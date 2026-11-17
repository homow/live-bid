import * as Inputs from "./inputs";
import {firstValueFrom} from "rxjs";
import * as Outputs from "./outputs";
import {Inject} from "@nestjs/common";
import * as Decorators from "./decorators";
import {ZodPipe} from "@app/gateway/common/pipes";
import {ClientProxy} from "@nestjs/microservices";
import {UUIDv7Schema} from "@live-bid/contracts/schemas";
import {CurrentUser} from "@app/gateway/common/decorators";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {USERS_PATTERNS} from "@live-bid/services/messages";
import {Args, ID, Mutation, Query, Resolver} from "@nestjs/graphql";
import {type UpdateProfileSchemaType, UpdateProfileSchema} from "@live-bid/contracts/schemas";
import type {GetProfileResponseService, PublicProfileResponseService, UpdateProfileRequestService, UpdateProfileResponseService, UserAccess} from "@live-bid/services/types";

/**
 * **UserResolver**
 *
 * Handles user profile operations for the GraphQL API.
 * This resolver communicates with the Auth microservice via the `ClientProxy` transport layer.
 *
 * @remarks
 * - All queries are decorated with custom security decorators (`Decorators.*`)
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
   * - Access control is enforced by `Decorators.getUsersProfile()`
   *
   * @example
   * query {
   *   publicProfile(userId: "01a17af7-648b-71f1-87dd-839d59660730") {
   *     username
   *     display_name
   *   }
   * }
   */
  @Decorators.GetPublicProfileDecorators()
  @Query(() => Outputs.PublicProfileOutput, {name: 'publicProfile'})
  publicProfile(
    @Args(
      'userId', {type: () => ID},
      new ZodPipe(UUIDv7Schema)
    ) userId: string
  ): Promise<Outputs.PublicProfileOutput> {
    return firstValueFrom<PublicProfileResponseService>(
      this.authClient.send(
        USERS_PATTERNS.PUBLIC_PROFILE,
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
   *   authenticated session to prevent users from reading other users' private data
   * - Access control is enforced by `Decorators.getMyProfile()`, which requires
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
  @Decorators.GetMyProfileDecorators()
  @Query(() => Outputs.GetProfileOutput, {name: 'myProfile'})
  myProfile(
    @CurrentUser() user: UserAccess
  ): Promise<GetProfileResponseService> {
    return firstValueFrom<GetProfileResponseService>(
      this.authClient.send(
        USERS_PATTERNS.MY_PROFILE,
        user.userId
      )
    );
  }

  /**
   * **Update the authenticated user's profile**
   *
   * Allows the currently authenticated user to modify their `username`
   * and/or `display_name`. The request is validated via Zod and delegated
   * to the auth microservice.
   *
   * @param input - The validated profile data (`username`, `display_name`)
   * @param user  - Authenticated user injected by `@CurrentUser()`
   * @returns UpdateProfileOutput - Only the fields that were actually modified
   *
   * @remarks
   * - Requires a valid authenticated session
   * - `input` is validated via `ZodPipe(ZodSchemas.UpdateProfileSchema)`
   * - Access control is enforced by `Decorators.GetUpdateProfileDecorators()`
   * - Throws `BAD_REQUEST` (`NO_CHANGES`) if no new values are provided
   * - Throws `UNAUTHORIZED` if no valid session is present
   *
   * @example
   * mutation {
   *   updateProfile(input: { display_name: "New Name" }) {
   *     username
   *     display_name
   *   }
   * }
   */
  @Decorators.GetUpdateProfileDecorators()
  @Mutation(() => Outputs.UpdateProfileOutput, {name: 'updateProfile'})
  updateProfile(
    @Args(
      'input',
      {type: () => Inputs.UpdateProfileInput},
      new ZodPipe(UpdateProfileSchema)
    ) input: UpdateProfileSchemaType,
    @CurrentUser() user: UserAccess
  ): Promise<UpdateProfileResponseService> {
    return firstValueFrom<UpdateProfileResponseService>(
      this.authClient.send(
        USERS_PATTERNS.UPDATE_PROFILE,
        {
          userId: user.userId,
          updatableData: input
        } satisfies UpdateProfileRequestService
      )
    );
  }

  @Decorators.GetUserListDecorators()
  @Query(() => String)
  users() {
    return 'user list';
  }
}
