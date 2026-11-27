import Redis from "ioredis";
import {randomBytes} from "node:crypto";
import {CacheService} from "./cache.service";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {appErrorOf} from '../../../../test/helpers/errors';
import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";

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

  // ================================
  // |        set and get           |
  // ================================
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

  // ================================
  // |          setNX                |
  // ================================
  describe("setNX", () => {
    it("writes only when the key is free", async () => {
      await expect(cache.setNX("nx", "first")).resolves.toBe("OK");
      await expect(cache.setNX("nx", "second")).resolves.toBeNull();

      await expect(cache.get("nx")).resolves.toBe("first");
    });
  });

  // ================================
  // |        delete                |
  // ================================
  describe("delete", () => {
    it("removes several keys at once and counts them", async () => {
      await cache.set("del-a", 1);
      await cache.set("del-b", 2);

      await expect(cache.delete("del-a", "del-b", "del-never-existed")).resolves.toBe(2);

      await expect(cache.get("del-a")).resolves.toBeNull();
      await expect(cache.get("del-b")).resolves.toBeNull();
    });
  });

  // ================================
  // |        getDel                |
  // ================================
  describe("getDel", () => {
    it("returns the value and removes it, so it can only be read once", async () => {
      await cache.set("one-shot", {secret: true});

      await expect(cache.getDel("one-shot")).resolves.toEqual({secret: true});
      await expect(cache.getDel("one-shot")).resolves.toBeNull();
    });
  });

  // ================================
  // |    setPwdTokenAtomic         |
  // ================================
  describe("setPwdTokenAtomic", () => {
    const payload = {id: "user-1", email: "dpk@example.com"};

    it("writes the token key and the user lock together, both with the TTL", async () => {
      const written = await cache.setPwdTokenAtomic("pwd:token:t1", "pwd:user:u1", payload, "hash-1", 60_000);

      expect(written).toBe(true);

      // The prefix has to be applied to the keys inside the Lua script too
      expect(JSON.parse((await raw.get(fullKey("pwd:token:t1")))!)).toEqual(payload);
      expect(await raw.get(fullKey("pwd:user:u1"))).toBe("hash-1");
      expect(await raw.pttl(fullKey("pwd:token:t1"))).toBeGreaterThan(55_000);
      expect(await raw.pttl(fullKey("pwd:user:u1"))).toBeGreaterThan(55_000);
    });

    it("refuses while the user lock exists, and leaves the first token alone", async () => {
      await cache.setPwdTokenAtomic("pwd:token:t2", "pwd:user:u2", payload, "hash-first", 60_000);

      const second = await cache.setPwdTokenAtomic("pwd:token:t3", "pwd:user:u2", payload, "hash-second", 60_000);

      expect(second).toBe(false);
      expect(await raw.exists(fullKey("pwd:token:t3"))).toBe(0);
      expect(await raw.get(fullKey("pwd:user:u2"))).toBe("hash-first");
    });

    it("lets only one of many parallel requests through", async () => {
      const attempts = Array.from({length: 10}, (_, index) =>
        cache.setPwdTokenAtomic(`pwd:token:race-${index}`, "pwd:user:race", payload, `hash-${index}`, 60_000),
      );

      const results = await Promise.all(attempts);

      expect(results.filter(Boolean)).toHaveLength(1);
      expect(await raw.keys(fullKey("pwd:token:race-*"))).toHaveLength(1);
    });

    it("pairs with getDel for a single-use token", async () => {
      await cache.setPwdTokenAtomic("pwd:token:t4", "pwd:user:u4", payload, "hash-4", 60_000);

      await expect(cache.getDel("pwd:token:t4")).resolves.toEqual(payload);
      await expect(cache.getDel("pwd:token:t4")).resolves.toBeNull();
    });
  });

  // ================================
  // |        cache version         |
  // ================================
  describe("cache versions", () => {
    it("starts at 1 and stays there until it is bumped", async () => {
      await expect(cache.getCacheVersion("version:fresh")).resolves.toBe(1);
      await expect(cache.getCacheVersion("version:fresh")).resolves.toBe(1);
    });

    it("moves forward with incrementCacheVersion", async () => {
      await cache.getCacheVersion("version:bumped");

      await expect(cache.incrementCacheVersion("version:bumped")).resolves.toBe(2);
      await expect(cache.getCacheVersion("version:bumped")).resolves.toBe(2);
    });

    it("throws a 500 when the stored version isn't a positive integer", async () => {
      await raw.set(fullKey("version:broken"), "not-a-number");

      const error = await appErrorOf(cache.getCacheVersion("version:broken"));

      expect(error).toMatchObject({statusCode: 500, code: "Redis cache version error"});
    });
  });

  // ================================
  // |        deletePrefix          |
  // ================================
  describe("deletePrefix", () => {
    // Fails until deletePrefix applies the key prefix to the pattern, see the notes
    it("deletes every key that starts with the given prefix, and only those", async () => {
      await cache.set("group:1", "a");
      await cache.set("group:2", "b");
      await cache.set("other:1", "c");

      await expect(cache.deletePrefix("group:*")).resolves.toBe(2);

      await expect(cache.get("group:1")).resolves.toBeNull();
      await expect(cache.get("group:2")).resolves.toBeNull();
      await expect(cache.get("other:1")).resolves.toBe("c");
    });

    it("also works with a leading wildcard, which is what the cache-evict interceptor sends", async () => {
      await cache.set("wild:zebra:1", "a");
      await cache.set("wild:zebra:2", "b");
      await cache.set("wild:keep:1", "c");

      await expect(cache.deletePrefix("*zebra*")).resolves.toBe(2);

      await expect(cache.get("wild:keep:1")).resolves.toBe("c");
    });

    it("returns null when nothing matches", async () => {
      await expect(cache.deletePrefix("nothing-here:*")).resolves.toBeNull();
    });
  });
});
