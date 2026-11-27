import {RedisKey} from "@live-bid/services/cache";
import {ONE_HOUR_MS} from "@live-bid/services/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {SafeUser} from "@live-bid/services/types";
import {UsersCacheService} from "./users-cache.service";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {appErrorOf} from "../../../../../../test/helpers/errors";

/**
 * UsersCacheService with the Redis cache and the repository faked.
 * Key names come from RedisKey itself, so these tests don't care what the keys look like.
 */

const USER_ID = "01900000-0000-7000-8000-000000000001";
const LIST_VERSION_KEY = "user:list:version";

const safeUser: SafeUser = {
  id: USER_ID,
  role: UserRoleEnum.USER,
  email: "dpk@example.com",
  username: null,
  is_active: true,
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
  display_name: "dpk",
};

const listOptions = {limit: 10, offset: 0, orderBy: "display_name", sortBy: "desc"} as never;

/** Lets fire-and-forget promises settle before we look at what they did */
const flush = () => new Promise((resolve) => setImmediate(resolve));

function setup() {
  const logger = {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()};
  const cache = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    delete: vi.fn().mockResolvedValue(1),
    getCacheVersion: vi.fn().mockResolvedValue(1),
    incrementCacheVersion: vi.fn().mockResolvedValue(2),
  };
  const userRepository = {findOne: vi.fn(), findMany: vi.fn()};

  const service = new UsersCacheService(logger as never, cache as never, userRepository as never);

  return {service, logger, cache, userRepository};
}

describe("UsersCacheService", () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  // ===========================
  // |    setCacheUserInfo     |
  // ===========================
  describe("setCacheUserInfo", () => {
    it("stores the user under its profile key for one hour", () => {
      ctx.service.setCacheUserInfo(safeUser);

      expect(ctx.cache.set).toHaveBeenCalledWith(RedisKey.getUserProfileKey(USER_ID), safeUser, ONE_HOUR_MS);
    });

    it("logs a failed write and doesn't throw, since the cache is only a shortcut", async () => {
      ctx.cache.set.mockRejectedValue(new Error("redis is down"));

      expect(() => ctx.service.setCacheUserInfo(safeUser)).not.toThrow();
      await flush();

      expect(ctx.logger.error).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================
  // |    getCachedUserInfo    |
  // ===========================
  describe("getCachedUserInfo", () => {
    it("returns whatever the cache has under the profile key", async () => {
      ctx.cache.get.mockResolvedValue(safeUser);

      await expect(ctx.service.getCachedUserInfo(USER_ID)).resolves.toBe(safeUser);

      expect(ctx.cache.get).toHaveBeenCalledWith(RedisKey.getUserProfileKey(USER_ID));
    });

    it("returns null on a miss", async () => {
      await expect(ctx.service.getCachedUserInfo(USER_ID)).resolves.toBeNull();
    });
  });

  // ===========================
  // |    getOrSetUserCache    |
  // ===========================
  describe("getOrSetUserCache", () => {
    it("returns the cached user without touching the database", async () => {
      ctx.cache.get.mockResolvedValue(safeUser);

      await expect(ctx.service.getOrSetUserCache(USER_ID)).resolves.toBe(safeUser);

      expect(ctx.userRepository.findOne).not.toHaveBeenCalled();
    });

    it("loads from the database on a miss, then caches the result", async () => {
      ctx.userRepository.findOne.mockResolvedValue(safeUser);

      await expect(ctx.service.getOrSetUserCache(USER_ID)).resolves.toBe(safeUser);

      expect(ctx.userRepository.findOne).toHaveBeenCalledWith({id: USER_ID, lock: undefined}, true);
      expect(ctx.cache.set).toHaveBeenCalledWith(RedisKey.getUserProfileKey(USER_ID), safeUser, ONE_HOUR_MS);
    });

    it("passes the lock request on to the repository", async () => {
      ctx.userRepository.findOne.mockResolvedValue(safeUser);

      await ctx.service.getOrSetUserCache(USER_ID, true);

      expect(ctx.userRepository.findOne).toHaveBeenCalledWith({id: USER_ID, lock: true}, true);
    });

    it("answers 404 and caches nothing when the user doesn't exist", async () => {
      ctx.userRepository.findOne.mockResolvedValue(null);

      const error = await appErrorOf(ctx.service.getOrSetUserCache(USER_ID));

      expect(error).toMatchObject({statusCode: 404, code: "NOT_FOUND"});
      expect(ctx.cache.set).not.toHaveBeenCalled();
    });
  });

  // ===========================
  // |    deleteUserCache      |
  // ============================
  describe("deleteUserCache", () => {
    it("deletes the profile key and returns how many keys went", async () => {
      await expect(ctx.service.deleteUserCache(USER_ID)).resolves.toBe(1);

      expect(ctx.cache.delete).toHaveBeenCalledWith(RedisKey.getUserProfileKey(USER_ID));
    });

    it("logs a failure and doesn't throw", async () => {
      ctx.cache.delete.mockRejectedValue(new Error("redis is down"));

      await expect(ctx.service.deleteUserCache(USER_ID)).resolves.toBeUndefined();

      expect(ctx.logger.error).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================
  // |  getOrSetCacheUserList  |
  // ===========================
  describe("getOrSetCacheUserList", () => {
    it("returns a cached list without touching the database", async () => {
      ctx.cache.get.mockResolvedValue([safeUser]);

      await expect(ctx.service.getOrSetCacheUserList(listOptions)).resolves.toEqual([safeUser]);

      expect(ctx.userRepository.findMany).not.toHaveBeenCalled();
    });

    it("treats a cached empty list as a hit", async () => {
      ctx.cache.get.mockResolvedValue([]);

      await expect(ctx.service.getOrSetCacheUserList(listOptions)).resolves.toEqual([]);

      expect(ctx.userRepository.findMany).not.toHaveBeenCalled();
    });

    it("queries the database on a miss and caches the result for an hour", async () => {
      ctx.userRepository.findMany.mockResolvedValue([safeUser]);

      await expect(ctx.service.getOrSetCacheUserList(listOptions)).resolves.toEqual([safeUser]);

      expect(ctx.userRepository.findMany).toHaveBeenCalledWith(listOptions);
      expect(ctx.cache.set).toHaveBeenCalledWith(ctx.cache.get.mock.calls[0][0], [safeUser], ONE_HOUR_MS);
    });

    it("still returns the database result when caching it fails", async () => {
      ctx.userRepository.findMany.mockResolvedValue([safeUser]);
      ctx.cache.set.mockRejectedValue(new Error("redis is down"));

      await expect(ctx.service.getOrSetCacheUserList(listOptions)).resolves.toEqual([safeUser]);
      await flush();

      expect(ctx.logger.error).toHaveBeenCalledTimes(1);
    });

    it("looks lists up under a key that changes with the list version", async () => {
      ctx.cache.getCacheVersion.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
      ctx.userRepository.findMany.mockResolvedValue([]);

      await ctx.service.getOrSetCacheUserList(listOptions);
      await ctx.service.getOrSetCacheUserList(listOptions);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [firstKey] = ctx.cache.get.mock.calls[0];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [secondKey] = ctx.cache.get.mock.calls[1];
      expect(firstKey).not.toBe(secondKey);
    });
  });

  // ============================
  // | incrementUserListVersion |
  // ============================
  describe("incrementUserListVersion", () => {
    it("bumps the shared list version", () => {
      ctx.service.incrementUserListVersion();

      expect(ctx.cache.incrementCacheVersion).toHaveBeenCalledWith(LIST_VERSION_KEY);
    });

    it("logs a failure and doesn't throw", async () => {
      ctx.cache.incrementCacheVersion.mockRejectedValue(new Error("redis is down"));

      expect(() => ctx.service.incrementUserListVersion()).not.toThrow();
      await flush();

      expect(ctx.logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
