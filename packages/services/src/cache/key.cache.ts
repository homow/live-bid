import {AppException} from "../lib";
import type {Request} from "express";
import {TablesName} from "../database";

export interface ParamCacheKeyType {
  req: Request;
  resource: TablesName;
  self?: boolean;
  extraKeys?: string[];
  paramsKey?: string[];
  pagination?: boolean;
  query?: string[];
}

export class RedisKey {
  /**
   * Builds a Redis key with the format: {prefix}:{resource}:{part1}:{part2}:...
   * If no meaningful parts are provided, returns the pattern {prefix}:{resource}:list
   *
   * @example
   * RedisKey.build('users')           → "app:users:list"
   * RedisKey.build('users', '123')    → "app:users:123"
   * RedisKey.build('users', '')       → "app:users:list"   (empty after trim)
   */
  static build(resource: TablesName, ...parts: (string | undefined | number)[]): string {
    const cleanParts = parts
      .filter(p => p !== undefined && p !== null)
      .map(p => p.toString().trim())
      .filter(Boolean);

    return cleanParts.length === 0
      ? `${resource}:list`
      : `${resource}:${cleanParts.join(':')}`;
  }

  /** Builds key patterns for redis cache
   * @example
   * RedisKey.keyPrefix([
   *   {paramsKey: ["id"], resource: "users"},
   *   {resource: "users", extraKeys: ["sale", "rent"], paramsKey: ["id"]},
   * ]) → [
   * "app:users:id=5b570b4b-2da6-4d7c-826b-be0f7323611b"
   * "app:users:sale:rent:id=5b570b4b-2da6-4d7c-826b-be0f7323611b",
   * ]
   */
  static keyPrefix({req, resource, extraKeys, self = false, paramsKey, pagination = false, query}: ParamCacheKeyType): string {
    const parts: (string | undefined)[] = [];

    if (extraKeys !== undefined && extraKeys.length) {
      parts.push(...extraKeys);
    }

    if (self) {
      const selfId = req.user.userId;

      if (!selfId) throw new AppException({
        statusCode: 500,
        code: "User id not found in request",
        message: `in ${this.keyPrefix.name} function. when create a cache key`,
      });

      parts.push(...RedisKey.getUserProfileKey(selfId));
    }

    if (paramsKey !== undefined && paramsKey.length) {
      const params: (string | undefined)[] = paramsKey.map(p => Array.isArray(req.params[p])
        ? req.params[p][0] !== undefined ? `${p}=${req.params[p][0]}` : undefined
        : req.params[p] !== undefined ? `${p}=${req.params[p]}` : undefined
      );
      parts.push(...params);
    }

    if (pagination) {
      const page = (req.query.page === undefined || req.query.page === null) ? "1" : req.query.page as string;
      const limit = (req.query.limit === undefined || req.query.limit === null) ? "10" : req.query.limit as string;
      const sort = (req.query.sort === undefined || req.query.sort === null) ? "desc" : req.query.sort as string;
      parts.push('list', `page=${page}`, `limit=${limit}`, `sort=${sort}`);
    }

    if (query !== undefined && query.length) {
      const allQuery: (string | undefined)[] = query.map(q =>
        typeof req.query[q] === 'string'
          ? `${q}=${req.query[q]}`
          : undefined
      );
      parts.push(...allQuery);
    }

    return RedisKey.build(resource, ...parts);
  }

  static getUserProfileKey(id: string) {
    return ["profile", `user-id=${id}`];
  }
}
