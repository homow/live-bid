import Redis from "ioredis";
import {randomBytes} from "node:crypto";
import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";

import {CacheService} from "./cache.service";
import {appErrorOf} from "../../../../test/helpers/errors";

/**
 * CacheService against a real Redis.
 *
 * Safe to run next to your dev data: everything lives in database 15 under a
 * random key prefix, and only that prefix is cleaned up at the end.
 * Set TEST_REDIS_HOST / TEST_REDIS_PORT if Redis isn't on 127.0.0.1:6379.
 */

const HOST = process.env.TEST_REDIS_HOST ?? "127.0.0.1";
const PORT = Number(process.env.TEST_REDIS_PORT ?? 6379);
const TEST_DB = 15;

const PREFIX = `livebid-test-${randomBytes(4).toString("hex")}`;
const fullKey = (key: string) => `${PREFIX}:${key}`;

const settings: Record<string, string> = {
  REDIS_HOST: HOST,
  REDIS_PORT: String(PORT),
  REDIS_DB: String(TEST_DB),
  REDIS_KEY_PREFIX: PREFIX,
};

describe("CacheService (real Redis)", () => {

});
