import {PinoLogger} from "nestjs-pino";
import {and, eq, SQL} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import {AppException} from "@live-bid/services/lib";
import {DrizzleService} from "@live-bid/services/modules";
import {USER_PUBLIC_COLUMNS} from "../users/users.repository";
import {refreshToken, user} from "@live-bid/services/database";
import type {DrizzleTransaction} from "@live-bid/services/types";
import {REFRESH_TOKEN_PUBLIC_COLUMNS} from "@app/auth/common/constants";
import type {ChangePasswordRepositoryParams, RefreshTokenInsert} from "@app/auth/types/auth";

@Injectable()
export class AuthRepository {
  constructor(
    private readonly logger: PinoLogger,
    private readonly drizzle: DrizzleService,
  ) {
    this.logger.setContext(AuthRepository.name);
  }

  /**
   * Inserts a new refresh token row.
   *
   * @param data - Refresh token insert payload.
   * @param tx     - Optional transaction; falls back to `drizzle.db`.
   */
  insertRefreshToken(data: RefreshTokenInsert, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    return db
      .insert(refreshToken)
      .values(data);
  }

  /**
   * Finds a refresh token record by its hash.
   *
   * @param tokenHash - SHA-256 hash of the refresh token.
   * @param tx
   */
  findRefreshRecord(tokenHash: string, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    return db
      .select(REFRESH_TOKEN_PUBLIC_COLUMNS)
      .from(refreshToken)
      .where(eq(refreshToken.token_hash, tokenHash))
      .for('update');
  }

  /**
   * Finds a refresh token by hash, joined with its public user record.
   *
   * @param tokenHash - SHA-256 hash of the refresh token.
   * @param tx
   */
  findRefreshRecordWithUser(tokenHash: string, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    return db
      .select({
        ...REFRESH_TOKEN_PUBLIC_COLUMNS,

        // Public User Record
        user: USER_PUBLIC_COLUMNS,
      })
      .from(refreshToken)
      .where(eq(refreshToken.token_hash, tokenHash))
      .leftJoin(user, eq(refreshToken.user_id, user.id))
      .for('update', {of: refreshToken});
  }

  /**
   * Marks **all** refresh tokens of a user as revoked.
   *
   * Used after password change/reset to force re-authentication on every device.
   *
   * @param userId - Target user ID.
   * @param tx     - Optional transaction; falls back to `drizzle.db`.
   */
  async revokeAllUserTokens(userId: string, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    await db
      .update(refreshToken)
      .set({is_revoked: true})
      .where(eq(refreshToken.user_id, userId));
  }

  /**
   * Rotates a refresh token: revokes the old one and inserts a new one atomically.
   *
   * The old token is only revoked if `is_revoked = false`. If the update
   * affects zero rows, the token was already used or revoked (race or replay):
   * all sessions for the user are revoked in the same transaction and a 401
   * is thrown so the client clears its cookies.
   *
   * @param oldTokenId - ID of the token to rotate out.
   * @param newTokenData - Data for the newly issued token.
   * @param tx
   * @returns The newly inserted refresh token row.
   *
   * @throws {AppException} 401 REFRESH_TOKEN_REUSE — old token already revoked;
   *   all user sessions revoked in the same transaction.
   *
   * @remarks
   * Runs inside a single DB transaction. `replace_by_token_id` is set on the
   * old row for audit/traceability.
   */
  async rotateToken(
    oldTokenId: string,
    newTokenData: RefreshTokenInsert,
    tx?: DrizzleTransaction,
  ) {
    const db = tx ?? this.drizzle.db;

    const updated = await db
      .update(refreshToken)
      .set({is_revoked: true})
      .where(and(
        eq(refreshToken.id, oldTokenId),
        eq(refreshToken.is_revoked, false)
      ))
      .returning({
        id: refreshToken.id
      });

    if (!updated.length) {
      await this.revokeAllUserTokens(newTokenData.user_id, tx);

      this.logger.warn(
        {userId: newTokenData.user_id, oldTokenId},
        'Refresh token reuse detected — all sessions revoked'
      );

      throw new AppException({
        statusCode: 401,
        code: 'REFRESH_TOKEN_REUSE',
        message: 'Refresh token reuse detected. All sessions revoked for security.',
        meta: {clearAuthCookies: true},
      });
    }

    const [newToken] = await db
      .insert(refreshToken)
      .values(newTokenData)
      .returning();

    await db
      .update(refreshToken)
      .set({replace_by_token_id: newToken.id})
      .where(eq(refreshToken.id, oldTokenId));

    return newToken;
  }

  /**
   * Revokes a single refresh token by its hash.
   *
   * @param tokenHash - SHA-256 hash of the refresh token.
   * @param tx - Optional transaction; falls back to `drizzle.db`.
   */
  async revokeToken(tokenHash: string, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    await db
      .update(refreshToken)
      .set({is_revoked: true})
      .where(eq(refreshToken.token_hash, tokenHash));
  }

  /**
   * Updates the user's password hash.
   *
   * The user is identified by `id` (preferred) or `email`.
   *
   * @param params - Contains `password` (already hashed), and `id` or `email`.
   * @param tx - Optional transaction; falls back to `drizzle.db`.
   *
   * @throws {AppException} 500 — neither `id` nor `email` was provided.
   */
  async changePassword({password, id, email}: ChangePasswordRepositoryParams, tx?: DrizzleTransaction) {
    let whereQuery: SQL<unknown>;

    if (id) {
      whereQuery = eq(user.id, id);
    } else if (email) {
      whereQuery = eq(user.email, email);
    } else {
      throw new AppException({
        statusCode: 500,
        code: 'MISSING_IDENTIFIER',
        message: `Either 'email' or 'id' must be provided to change the user password. (${AuthRepository.name})`,
      });
    }

    const db = tx ?? this.drizzle.db;

    await db
      .update(user)
      .set({password})
      .where(whereQuery);
  }
}
