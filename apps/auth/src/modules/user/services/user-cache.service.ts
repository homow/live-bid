import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {RedisKey} from "@live-bid/services/cache";
import {UserRepository} from "../user.repository";
import {CacheService} from "@live-bid/services/cache";
import type {SafeUser} from "@live-bid/services/types";
import {ONE_HOUR_MS, throwNotFoundEx} from "@live-bid/services/lib";

/**
 * Service responsible for caching user data using Redis.
 *
 * - Uses a **Cache-Aside** pattern.
 * - Writes are **fire-and-forget** to avoid blocking the main flow.
 * - Errors are logged but never thrown — cache is treated as a secondary layer.
 */
@Injectable()
export class UserCacheService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly cache: CacheService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Stores a user object in Redis.
   *
   * - TTL: **1 hour**
   * - Fire-and-forget: no `await`, no blocking.
   * - Errors are caught and logged silently.
   *
   * @param userResponse - Safe user object (without sensitive fields)
   */
  setCacheUserInfo(userResponse: SafeUser) {
    const key = RedisKey.build('user', ...RedisKey.getUserProfileKey(userResponse.id));
    void this.cache.set<SafeUser>(key, userResponse, ONE_HOUR_MS).catch(reason => {
      this.logger.error('Failed to cache user: ', reason);
    });
  }

  /**
   * Fetches a user from Redis by ID.
   *
   * @param id - User ID
   * @returns The cached user, or `null` if not found
   */
  getCachedUserInfo(id: string) {
    const key = RedisKey.build('user', ...RedisKey.getUserProfileKey(id));
    return this.cache.get<SafeUser>(key);
  }

  /**
   * Resolves a user using the **Cache-Aside** strategy:
   *
   * 1. Check Redis cache.
   * 2. On miss, fetch from database.
   * 3. Store result in cache (async) and return.
   * 4. Throws `NotFoundException` if user doesn't exist in DB.
   *
   * @param id - User ID
   * @returns The resolved user object
   */
  async getOrSetUserCache(id: string) {
    const userCached = await this.getCachedUserInfo(id);
    if (userCached) return userCached;

    const findUser = await this.userRepository.findOne({id}, true);

    // Throw exception if user doesn't in database
    if (!findUser) throw throwNotFoundEx('User');

    this.setCacheUserInfo(findUser);

    return findUser;
  }
}
