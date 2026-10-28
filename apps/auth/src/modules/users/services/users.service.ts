import {Injectable} from "@nestjs/common";
import {UsersCacheService} from "./users-cache.service";
import type {PublicProfileResponseService} from "@live-bid/services/types";

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
    private readonly usersCacheService: UsersCacheService
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
}
