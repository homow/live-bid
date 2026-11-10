import Redis from "ioredis";
import {ConfigService} from "@nestjs/config";
import {AppException, ONE_MINUTE_MS} from "../lib";
import type {ResetTokenPayloadTypes} from "../types";
import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private readonly db: number;
  private readonly port: number;
  private readonly host: string;
  private readonly prefix: string;
  private readonly defaultTTL: number;

  private static readonly SET_PWD_TOKEN_LUA = `
    if redis.call('EXISTS', KEYS[2]) == 1 then
      return 0
    end
    redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[3])
    redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3])
    return 1
  `;

  constructor(readonly config: ConfigService) {
    this.db = Number(this.config.get<string>("REDIS_DB")) || 0;
    this.host = this.config.get<string>("REDIS_HOST") || '127.0.0.1';
    this.prefix = (config.get<string>("REDIS_KEY_PREFIX") ?? "app") + ":";
    this.port = Number(this.config.get<string>("REDIS_PORT")) || 6379;
    this.defaultTTL = ONE_MINUTE_MS * 5;
  }

  onModuleInit(): void {
    this.client = new Redis({
      db: this.db,
      host: this.host,
      port: this.port,
      lazyConnect: true,
      keyPrefix: this.prefix,
    });

    this.client.on("connect", () => {
      console.log("Redis Connected Successfully✅");
    });

    this.client.on("error", e => {
      console.log("Redis Error⛔: ", e);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  private getClient(): Redis {
    if (!this.client) {
      throw new AppException({
        statusCode: 500,
        code: "Redis client error",
        message: `Redis client not initialized in ${CacheService.name}`,
      });
    }
    return this.client;
  }

  /** set cache value with key */
  set<T>(key: string, value: T, ttl?: number): Promise<"OK"> {
    return this.getClient().set(
      key,
      JSON.stringify(value),
      "PX",
      ttl ?? this.defaultTTL
    );
  }

  /** **Set value with key if only not exist** */
  setNX<T>(key: string, value: T, ttl?: number): Promise<"OK" | null> {
    return this.getClient().set(
      key,
      JSON.stringify(value),
      "PX",
      ttl ?? this.defaultTTL,
      "NX"
    );
  }

  /** get cache value with key */
  async get<T>(key: string): Promise<T | null> {
    const value: string | null = await this.getClient().get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  /** delete many cache value with key */
  delete(...keys: string[]): Promise<number> {
    return this.getClient().del(...keys);
  }

  async getKeyPrefix(prefix: string): Promise<string[]> {
    const allKeys: string[] = [];
    let cursor: string = '0';

    do {
      const [nextCursor, keys] = await this.getClient().scan(
        cursor,
        'MATCH', prefix,
        'COUNT', 50
      );

      cursor = nextCursor;
      allKeys.push(...keys);
    } while (cursor !== '0');

    return allKeys;
  }

  /** delete many values with key prefix */
  async deletePrefix(prefix: string): Promise<number | null> {
    const keys: string[] = await this.getKeyPrefix(prefix);
    if (!keys.length) return null;

    const cleanKeys = this.cleanPrefix(keys);

    return await this.delete(...cleanKeys);
  }

  /** **get and delete atomically (for one-time tokens)** */
  async getDel<T>(key: string): Promise<T | null> {
    const value = await this.getClient().getdel(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  /**
   * Atomically: if `userKey` does not exist, write both `tokenKey`
   * and `userKey` with the given TTL. Returns `true` if written,
   * `false` if `userKey` already exists.
   */
  async setPwdTokenAtomic(
    tokenKey: string,
    userKey: string,
    value: ResetTokenPayloadTypes,
    tokenHash: string,
    ttlMs: number,
  ): Promise<boolean> {
    const result = await this.getClient().eval(
      CacheService.SET_PWD_TOKEN_LUA,
      2,
      tokenKey,
      userKey,
      JSON.stringify(value),
      tokenHash,
      String(ttlMs)
    );

    return result === 1;
  }

  cleanPrefix(keys: string[]): string[] {
    return keys.map(k =>
      k.startsWith(this.prefix)
        ? k.slice(this.prefix.length)
        : k
    );
  }
}
