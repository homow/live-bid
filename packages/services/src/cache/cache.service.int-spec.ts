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
  const logger = {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()};
  const cache = new CacheService(logger as never, {get: (key: string) => settings[key]} as never);

  // A second client without any prefix, to look at what really ended up in Redis
  const raw = new Redis({host: HOST, port: PORT, db: TEST_DB, lazyConnect: true});

  beforeAll(async () => {
    await cache.onModuleInit();
    await raw.connect();
  });

  afterAll(async () => {
    const leftovers = await raw.keys(`${PREFIX}:*`);
    if (leftovers.length) await raw.del(...leftovers);

    await cache.onModuleDestroy();
    await raw.quit();
  });

  describe("set and get", () => {
    it("round-trips a JSON value", async () => {
      await cache.set("roundtrip", {id: 1, tags: ["a", "b"]});

      await expect(cache.get("roundtrip")).resolves.toEqual({id: 1, tags: ["a", "b"]});
    });

    it("returns null for a key that isn't there", async () => {
      await expect(cache.get("missing")).resolves.toBeNull();
    });

    it("stores keys under the configured prefix", async () => {
      await cache.set("prefixed", "value");

      expect(await raw.exists(fullKey("prefixed"))).toBe(1);
      expect(await raw.exists("prefixed")).toBe(0);
    });

    it("applies the TTL it is given", async () => {
      await cache.set("with-ttl", "value", 60_000);

      const ttl = await raw.pttl(fullKey("with-ttl"));
      expect(ttl).toBeGreaterThan(55_000);
      expect(ttl).toBeLessThanOrEqual(60_000);
    });

    it("falls back to five minutes without a TTL", async () => {
      await cache.set("default-ttl", "value");

      const ttl = await raw.pttl(fullKey("default-ttl"));
      expect(ttl).toBeGreaterThan(295_000);
      expect(ttl).toBeLessThanOrEqual(300_000);
    });
  });

  describe("setNX", () => {
    it("writes only when the key is free", async () => {
      await expect(cache.setNX("nx", "first")).resolves.toBe("OK");
      await expect(cache.setNX("nx", "second")).resolves.toBeNull();

      await expect(cache.get("nx")).resolves.toBe("first");
    });
  });

  describe("delete", () => {
    it("removes several keys at once and counts them", async () => {
      await cache.set("del-a", 1);
      await cache.set("del-b", 2);

      await expect(cache.delete("del-a", "del-b", "del-never-existed")).resolves.toBe(2);

      await expect(cache.get("del-a")).resolves.toBeNull();
      await expect(cache.get("del-b")).resolves.toBeNull();
    });
  });

  describe("getDel", () => {
    it("returns the value and removes it, so it can only be read once", async () => {
      await cache.set("one-shot", {secret: true});

      await expect(cache.getDel("one-shot")).resolves.toEqual({secret: true});
      await expect(cache.getDel("one-shot")).resolves.toBeNull();
    });
  });

});
