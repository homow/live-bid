import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {RedisKey} from "@live-bid/services/cache";
import {UsersRepository} from "../users.repository";
import {CacheService} from "@live-bid/services/cache";
import type {SafeUser} from "@live-bid/services/types";
import {throwNotFound, ONE_HOUR_MS} from "@live-bid/services/lib";

/**
 * **UsersCacheService**
 *
 * Redis-backed caching layer for user data.
 * Implements the **Cache-Aside** pattern to reduce database load
 * during read-heavy flows (e.g., auth validation, profile lookups).
 *
 * @remarks
 * - **Cache-Aside:** the service checks the cache first, falls back to the
 *   database on a miss, and populates the cache for subsequent calls.
 * - **Fire-and-forget writes:** `setCacheUserInfo` does not block the caller.
 *   Failures are logged but never thrown, since the cache is secondary to the DB.
 * - **TTL:** cached users expire after **1 hour**.
 * - **Serialization:** `Date` fields are re-hydrated back to `Date` objects
 *   when reading from Redis.
 *
 * ### Available operations
 * | Method | Purpose | Cache-Aside |
 * |---|---|---|
 * | `setCacheUserInfo` | Write user to Redis (1h TTL) | – |
 * | `getCachedUserInfo` | Read user from Redis | – |
 * | `getOrSetUserCache` | Read → fallback to DB → cache | ✅ |
 */
@Injectable()
export class UsersCacheService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly cache: CacheService,
    private readonly userRepository: UsersRepository,
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
   * Re-hydrates `created_at` and `updated_at` into `Date` instances,
   * since Redis stores them as strings.
   *
   * @param id - User ID
   * @returns The cached user, or `null` if not found
   */
  getCachedUserInfo(id: string): Promise<SafeUser | null> {
    const key = RedisKey.build('user', ...RedisKey.getUserProfileKey(id));
    return this.cache.get<SafeUser>(key);
  }

  /**
   * Resolves a user using the **Cache-Aside** strategy.
   *
   * 1. Check Redis cache.
   * 2. On miss, fetch from database.
   * 3. Store result in cache (async, non-blocking) and return.
   *
   * @remarks
   * - The `lock` parameter is only applied to the **database fallback**
   *   (cache miss). Cached hits are always returned immediately without locking.
   * - Because locking requires a transaction, passing `lock = true` without
   *   an active transaction in the caller will not produce a real row lock.
   *   It's mainly intended for flows where the caller wants to ensure the
   *   freshly-fetched user is not concurrently modified before caching.
   *
   * @param id - User ID.
   * @param lock - When `true`, acquires a `FOR UPDATE` lock on the DB row
   *               (only on cache miss). Defaults to `undefined` (no lock).
   * @returns The resolved user object.
   * @throws {AppException} 404 — user not found in the database.
   */
  async getOrSetUserCache(id: string, lock?: true) {
    const userCached = await this.getCachedUserInfo(id);
    if (userCached) return userCached;

    const findUser = await this.userRepository.findOne({id, lock}, true);

    // Throw exception if user doesn't in database
    if (!findUser) throwNotFound('User', 'id');

    this.setCacheUserInfo(findUser);

    return findUser;
  }

  /**
   * Removes a user's profile from the Redis cache.
   *
   * @remarks
   * - Should be called after any operation that mutates user data
   *   (e.g., `updateProfile`, `changePassword`) to prevent serving stale data.
   * - The cache key is built using the same strategy as `getCachedUserInfo`
   *   and `setCacheUserInfo`, ensuring consistency.
   * - If the key does not exist, Redis silently ignores the operation
   *   (no error is thrown).
   *
   * @param id - The ID of the user whose cache should be invalidated.
   * @returns The result of the underlying Redis `DEL` command
   *          (typically the number of keys removed: `0` or `1`).
   */
  async deleteUserCache(id: string) {
    const key = RedisKey.build('user', ...RedisKey.getUserProfileKey(id));
    return await this.cache.delete(key);
  }
}
