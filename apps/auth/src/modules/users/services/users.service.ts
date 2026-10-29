import {Injectable} from "@nestjs/common";
import {UsersCacheService} from "./users-cache.service";
import type {GetProfileResponseService, PublicProfileResponseService} from "@live-bid/services/types";
import {MailService} from "@live-bid/services/modules";

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
    private readonly mailService: MailService,
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
    this.mailService.logs();
    return this.usersCacheService.getOrSetUserCache(userId);
  }
}
