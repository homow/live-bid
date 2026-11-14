import {Injectable} from "@nestjs/common";
import {UsersCacheService} from "./users-cache.service";
import {AppException, handleDrizzleError} from "@live-bid/services/lib";
import type {UpdateProfileSchemaType} from "@live-bid/contracts/schemas";
import {UsersRepository} from "@app/auth/modules/users/users.repository";
import type {GetProfileResponseService, PublicProfileResponseService, UpdateProfileRequestService, UpdateProfileResponseService} from "@live-bid/services/types";

/**
 * **UsersService**
 *
 * Business layer for user-related operations.
 * Responsible for shaping domain data into **service contracts** consumed by the Gateway.
 *
 * @remarks
 * - Relies on `UsersCacheService` for cache-aside reads
 * - **Mapping is done here**, not in the controller or the cache layer
 * - Only public fields are returned; private data (email, phone, etc.) never leaves this layer
 */
@Injectable()
export class UsersService {
  constructor(
    protected readonly usersRepository: UsersRepository,
    private readonly usersCacheService: UsersCacheService,
  ) {}

  /**
   * **Get a user's public profile**
   *
   * Loads the user (cache-first, DB on miss) and maps it to the public contract.
   *
   * @param userId - Target user's UUIDv7 identifier
   * @returns PublicProfileResponseService - Public profile with only safe fields
   *
   * @remarks
   * - Uses cache-aside via `UsersCacheService.getOrSetUserCache`
   * - Throws `NOT_FOUND` if the user does not exist (propagated from the cache service)
   * - Cache stores the raw record; mapping to the public contract happens here
   *
   * @example
   * const profile = await usersService.getPublicProfile(
   *   "01a17af7-648b-71f1-87dd-839d59660730"
   * );
   * // => { username, display_name, role, is_active }
   */
  async getPublicProfile(userId: string): Promise<PublicProfileResponseService> {

    const user = await this.usersCacheService.getOrSetUserCache(userId);

    return {
      role: user.role,
      username: user.username,
      is_active: user.is_active,
      display_name: user.display_name,
    };
  }

  /**
   * **Get the authenticated user's private profile**
   *
   * Loads the user (cache-first, DB on miss) and maps it to the private contract,
   * including sensitive fields (email, phone, ...) meant only for the owner.
   *
   * @param userId - Authenticated user's UUIDv7 identifier
   * @returns PrivateProfileResponseService - Full profile including private fields
   *
   * @remarks
   * - Cache-aside via `UsersCacheService.getOrSetUserCache`
   * - Throws `NOT_FOUND` if the user does not exist
   * - Owner-only access; authorization is enforced at the Gateway
   *
   * @example
   * const profile = await usersService.getMyProfile(
   *   "01a17af7-648b-71f1-87dd-839d59660730"
   * );
   * // => { id, username, display_name, role, email, phone, is_active, created_at }
   */
  getMyProfile(userId: string): Promise<GetProfileResponseService> {
    return this.usersCacheService.getOrSetUserCache(userId);
  }

  /**
   * **Update Authenticated User's Profile**
   *
   * Updates the profile details of the currently logged-in user.
   * Only specific fields are allowed to be modified.
   *
   * @remarks
   * **Allowed Fields:**
   * - `username`
   * - `display_name`
   *
   * **Flow & Behavior:**
   * - **Cache-First:** Reads the current user from cache (falls back to DB on a miss).
   * - **Change Detection:** Compares the new values with the current ones. If no actual changes are detected, it throws a `400 NO_CHANGES` error to avoid redundant DB writes.
   * - **Invalidation:** After a successful update, the user's cache is deleted (fire-and-forget) to prevent serving stale data.
   * - **Conflict Handling:** If the new `username` is already taken, the error is caught and formatted by `handleDrizzleError`.
   *
   * @param data - An object containing:
   *   - `userId`: The ID of the user to update.
   *   - `updatableData`: A partial object containing only the fields to be updated.
   *
   * @returns A partial object containing **only the fields that were actually updated**.
   *
   * @throws {AppException} `400` — If no changes were detected (`NO_CHANGES`).
   * @throws {AppException} — Propagated from `handleDrizzleError` on database conflicts (e.g., duplicate username).
   */
  async updateProfile({userId, updatableData}: UpdateProfileRequestService): Promise<UpdateProfileResponseService> {
    // Get user from db or cache
    const user = await this.usersCacheService.getOrSetUserCache(userId);

    const finalData: UpdateProfileSchemaType = {};

    if (updatableData.username !== undefined && updatableData.username !== user.username) {
      finalData.username = updatableData.username;
    }

    if (updatableData.display_name && updatableData.display_name !== user.display_name) {
      finalData.display_name = updatableData.display_name;
    }

    // Has anything to change?
    const hasChanges = Object.keys(finalData).length > 0;

    if (!hasChanges) throw new AppException({
      code: 'NO_CHANGES',
      message: 'No changes detected. Provide at least one new value.',
      statusCode: 400,
    });

    try {
      // Change data in db
      await this.usersRepository.updateProfile(userId, finalData);

      // Delete user cache(fire-and-forget)
      void this.usersCacheService.deleteUserCache(userId);

      return finalData;
    } catch (e) {
      handleDrizzleError({
        e,
        mainResource: 'user',
        conflictField: 'username',
      });
    }
  }
}
