import type {TablesName} from "../database";

/**
 * Parameters for building a structured cache key.
 */
export interface ParamCacheKeyType {
  /** Optional extra segments prepended to the key (e.g., custom namespaces). */
  extraKeys?: string[];
  /** If `true`, appends the `list` segment (used for paginated collections). */
  pagination?: boolean;
  /** The database table/resource name (root of the key). */
  resource: TablesName;
  /** Optional query parameters to include in the key (e.g., `{ status: 'active' }`). */
  inputs?: Record<string, string>;
}

/**
 * **RedisKey**
 *
 * Utility for building consistent, namespaced Redis keys.
 * All keys share the same flat structure: `<resource>:<segment1>:<segment2>:...`.
 *
 * @remarks
 * - **Validation:** Undefined, null, and empty segments are filtered out
 *   to avoid malformed keys (e.g., `user::profile`).
 * - **Default list key:** If no parts are provided, the key resolves to
 *   `<resource>:list`.
 * - **Deterministic:** The same inputs always produce the same key,
 *   which is essential for cache lookups.
 *
 * ### Examples
 * | Call | Result |
 * |---|---|
 * | `build('user')` | `user:list` |
 * | `build('user', 'id', 42)` | `user:id:42` |
 * | `keyPrefix({ resource: 'user', extraKeys: ['profile'], inputs: { id: '1' } })` | `user:profile:id=1` |
 * | `getUserProfileKey('42')` | `user:profile:user-id=42` |
 */
export class RedisKey {
  /**
   * Builds a Redis key from a resource name and arbitrary segments.
   *
   * @param resource - Root namespace (usually a table name).
   * @param parts - Segments appended to the key; empty values are filtered out.
   * @returns The final key, or `<resource>:list` if no valid parts remain.
   *
   * @example
   * RedisKey.build('user', 'session', 'userId=1'); // "user:session:userId=1"
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

  /**
   * Builds a cache key from structured parameters (namespace + query inputs).
   *
   * @param params - Structured cache parameters.
   * @returns The final cache key.
   *
   * @remarks
   * - `extraKeys` are prepended (act as a sub-namespace).
   * - `pagination: true` appends the `list` segment.
   * - `inputs` are serialized as `key=value` pairs.
   *
   * @example
   * RedisKey.keyPrefix({
   *   resource: 'user',
   *   extraKeys: ['profile'],
   *   inputs: { role: 'admin' },
   * }); // "user:profile:role=admin"
   */
  static keyPrefix({resource, extraKeys, inputs, pagination = false}: ParamCacheKeyType): string {
    const parts: (string | undefined)[] = [];

    if (extraKeys?.length) parts.push(...extraKeys);
    if (pagination) parts.push('list');

    if (inputs && Object.keys(inputs).length) {
      Object.entries(inputs).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        parts.push(`${key}=${value}`);
      });
    }

    return RedisKey.build(resource, ...parts);
  }

  /**
   * Returns the canonical key segments for a user's cached profile.
   *
   * Intended to be used with `RedisKey.build('user', ...RedisKey.getUserProfileKey(id))`.
   *
   * @param id - User ID.
   * @returns The segments `['profile', 'user-id=<id>']`.
   */
  static getUserProfileKey(id: string) {
    return ["profile", `user-id=${id}`];
  }
}
