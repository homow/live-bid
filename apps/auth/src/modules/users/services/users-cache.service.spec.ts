import {beforeEach, describe, expect, it, vi} from "vitest";

import {UsersCacheService} from "./users-cache.service";
import {RedisKey} from "@live-bid/services/cache";
import {ONE_HOUR_MS} from "@live-bid/services/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {SafeUser} from "@live-bid/services/types";
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
