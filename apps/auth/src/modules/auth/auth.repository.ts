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
    private readonly drizzle: DrizzleService,
  ) {}

  /**
   * Inserts a new refresh token row.
   *
   * @param data - Refresh token insert payload.
   */
  insertRefreshToken(data: RefreshTokenInsert) {
    return this.drizzle.db
      .insert(refreshToken)
      .values(data);
  }

  /**
   * Finds a refresh token record by its hash.
   *
   * @param tokenHash - SHA-256 hash of the refresh token.
   */
  findRefreshRecord(tokenHash: string) {
    return this.drizzle.db
      .select(REFRESH_TOKEN_PUBLIC_COLUMNS)
      .from(refreshToken)
      .where(eq(refreshToken.token_hash, tokenHash));
  }

  /**
   * Finds a refresh token by hash, joined with its public user record.
   *
   * @param tokenHash - SHA-256 hash of the refresh token.
   */
  findRefreshRecordWithUser(tokenHash: string) {
    return this.drizzle.db
      .select({
        ...REFRESH_TOKEN_PUBLIC_COLUMNS,

        // Public User Record
        user: USER_PUBLIC_COLUMNS,
      })
      .from(refreshToken)
      .where(eq(refreshToken.token_hash, tokenHash))
      .leftJoin(user, eq(refreshToken.user_id, user.id))
      .groupBy(
        refreshToken.id,
        user.id,
        user.email,
        user.username,
        user.is_active,
        user.updated_at,
        user.created_at,
        user.display_name,
      );
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
   * Rotates a refresh token: inserts a new one and revokes the old one atomically.
   *
   * The old token is only revoked if it hasn't been revoked yet (prevents replay).
   *
   * @param oldTokenId - ID of the token to rotate out.
   * @param newTokenData - Data for the newly issued token.
   * @returns The newly inserted refresh token row.
   *
   * @remarks
   * Runs inside a single DB transaction. `replace_by_token_id` is set on the
   * old row for audit/traceability.
   */
  rotateToken(
    oldTokenId: string,
    newTokenData: RefreshTokenInsert
  ) {
    return this.drizzle.db.transaction(async tx => {
      const [newToken] = await tx
        .insert(refreshToken)
        .values(newTokenData)
        .returning();

      await tx
        .update(refreshToken)
        .set({
          is_revoked: true,
          replace_by_token_id: newToken.id,
        })
        .where(and(
          eq(refreshToken.id, oldTokenId),
          eq(refreshToken.is_revoked, false)
        ));

      return newToken;
    });
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
