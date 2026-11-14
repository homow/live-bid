import {eq, SQL} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import {AppException} from "@live-bid/services/lib";
import * as Schemas from "@live-bid/contracts/schemas";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {DrizzleService} from "@live-bid/services/modules";
import {type User, user} from "@live-bid/services/database";
import type {FindOneUserParams} from "@app/auth/types/users";
import {USER_PUBLIC_COLUMNS} from "@app/auth/common/constants";
import type {UpdateProfileSchemaType} from "@live-bid/contracts/schemas";
import type {DrizzleTransaction, SafeUser} from "@live-bid/services/types";

/**
 * **UsersRepository**
 *
 * Data-access layer for user records.
 * Provides safe (public) and unsafe (full, including password) user lookups,
 * along with atomic user creation.
 *
 * @remarks
 * - **Transactions:** every method accepts an optional `tx: DrizzleTransaction`
 *   to participate in a caller-managed transaction, falling back to `drizzle.db`.
 * - **Safe vs. Unsafe:** `findOne` is overloaded. Passing `safe = true` (default)
 *   strips the `password` field and returns a `SafeUser`; passing `safe = false`
 *   returns the full `User` (needed for credential verification).
 * - **Lookup precedence:** when multiple identifiers are provided to `findOne`,
 *   the order is `id` → `email` → `username`. If none is given, a 500 is thrown.
 *
 * ### Available operations
 * | Method | Purpose | Returns |
 * |---|---|---|
 * | `insertUser` | Create a user with hashed password | `SafeUser` |
 * | `findOne` (safe) | Find user by id/email/username | `SafeUser \| null` |
 * | `findOne` (unsafe) | Find user including password | `User \| null` |
 * | `buildUserQuery` | Internal query builder (with optional `WHERE`) | Query |
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  /**
   * Inserts a new user with the given (already hashed) password.
   *
   * Defaults applied: `is_active = true` and `role = USER`.
   * The returned record excludes sensitive columns (`password`).
   *
   * @param data - Registration payload: `{ password (hashed), email, display_name }`.
   * @param tx - Optional transaction; falls back to `drizzle.db`.
   * @returns The created user, safe for client exposure.
   */
  async insertUser({password, email, display_name}: Schemas.RegisterUserSchemaType, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    const {username: _, ...othersData} = USER_PUBLIC_COLUMNS;

    return await db
      .insert(user)
      .values({
        email,
        password,
        display_name,
        is_active: true,
        role: UserRoleEnum.USER,
      })
      .returning(othersData);
  }

  /**
   * **Overload 1: When safe is true, returns SafeUser (without password)**
   */
  async findOne(
    params: FindOneUserParams,
    safe?: true,
    tx?: DrizzleTransaction
  ): Promise<SafeUser | null>;

  /**
   * **Overload 2: When safe is false, returns full User (with password)**
   */
  // noinspection JSUnusedGlobalSymbols
  async findOne(
    params: FindOneUserParams,
    safe?: false,
    tx?: DrizzleTransaction
  ): Promise<User | null>;

  /**
   * Finds a single user by `id`, `email`, or `username`.
   *
   * - Lookup priority: `id` → `email` → `username` (first non-empty wins).
   * - When `safe = true` (default), the `password` field is stripped.
   * - When `safe = false`, the full record (including `password`) is returned,
   *   typically for credential verification during login.
   * - When `lock = true` is passed inside `params`, a row-level lock
   *   (`FOR UPDATE`) is acquired on the matched row.
   *
   * @param params - At least one of `{ id, email, username }` must be provided.
   *                 Optionally includes `lock` to acquire a `FOR UPDATE` lock.
   * @param safe - Whether to omit sensitive fields (default: `true`).
   * @param tx - Optional transaction; falls back to `drizzle.db`.
   *             Required for `lock` to have a meaningful effect.
   * @returns The matching user (safe or full), or `null` if not found.
   * @throws {AppException} 500 — no identifier was provided.
   */
  async findOne(
    {
      id,
      email,
      username,
    }: FindOneUserParams,
    safe: boolean = true,
    tx?: DrizzleTransaction,
  ): Promise<SafeUser | User | null> {
    let eqUser: SQL<unknown>;

    if (id) {
      eqUser = eq(user.id, id);
    } else if (email) {
      eqUser = eq(user.email, email);
    } else if (username) {
      eqUser = eq(user.username, username);
    } else {
      throw new AppException({
        statusCode: 500,
        code: 'Missing identifier',
        message: `Either 'phone' or 'id' must be provided to find the user. in ${UsersRepository.name}`,
      });
    }

    const [findUser] = await this.buildUserQuery(eqUser, tx);

    if (!findUser) return null;

    if (!safe) {
      const {password: _, ...data} = findUser;
      return data satisfies SafeUser;
    }

    return findUser satisfies User;
  }

  /**
   * Builds a base user query, optionally filtered by a `WHERE` clause
   * and/or locked with `FOR UPDATE`.
   *
   * @param whereCondition - Optional SQL condition to filter the query.
   * @param tx - Optional transaction; falls back to `drizzle.db`.
   * @param lock - When `true`, appends a `FOR UPDATE` clause to lock the
   *               matched rows. Should only be used inside a transaction.
   * @returns A Drizzle query object (executable).
   */
  buildUserQuery(whereCondition?: SQL<unknown>, tx?: DrizzleTransaction, lock?: boolean) {
    const db = tx ?? this.drizzle.db;

    const query = db
      .select()
      .from(user)
      .groupBy(user.id);

    if (whereCondition) {

      if (lock) {
        return query
          .where(whereCondition)
          .for('update');
      }

      return query.where(whereCondition);
    }

    if (lock) return query.for('update');

    return query;
  }

  /**
   * Updates the editable fields of a user's profile.
   *
   * @remarks
   * - Only **`username`** and **`display_name`** are allowed to be updated.
   *   Any other field in `data` is silently ignored to prevent mass-assignment
   *   vulnerabilities (e.g., a client trying to change `role` or `is_active`).
   * - This method does not throw if the user does not exist (Drizzle returns 0 rows);
   *   existence checks should be handled by the caller if required.
   * - Cache invalidation is the caller's responsibility (e.g., `UsersCacheService`).
   *
   * @param userId - ID of the user whose profile is being updated.
   * @param data - Partial profile data. Only `username` and `display_name` are applied.
   * @returns A promise that resolves once the update is executed.
   */
  async updateProfile(userId: string, data: UpdateProfileSchemaType) {
    await this.drizzle.db
      .update(user)
      .set(data)
      .where(eq(user.id, userId));
  }
}
