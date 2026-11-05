import {and, eq} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import type {RefreshTokenInsert} from "@app/auth/types";
import {DrizzleService} from "@live-bid/services/modules";
import {USER_PUBLIC_COLUMNS} from "../users/users.repository";
import {refreshToken, user} from "@live-bid/services/database";
import type {DrizzleTransaction} from "@live-bid/services/types";

export const REFRESH_TOKEN_PUBLIC_COLUMNS = {
  id: refreshToken.id,
  user_id: refreshToken.user_id,
  token_hash: refreshToken.token_hash,
  is_revoked: refreshToken.is_revoked,
  expires_in: refreshToken.expires_in,
  created_at: refreshToken.created_at,
  updated_at: refreshToken.updated_at,
  remember_me: refreshToken.remember_me,
  replace_by_token_id: refreshToken.replace_by_token_id,
};

@Injectable()
export class AuthRepository {
  constructor(
    private readonly drizzle: DrizzleService,
  ) {}

  insertRefreshToken(data: RefreshTokenInsert) {
    return this.drizzle.db
      .insert(refreshToken)
      .values(data);
  }

  findRefreshRecord(tokenHash: string) {
    return this.drizzle.db
      .select(REFRESH_TOKEN_PUBLIC_COLUMNS)
      .from(refreshToken)
      .where(eq(refreshToken.token_hash, tokenHash));
  }

  findRefreshRecordWithUser(tokenHash: string) {
    return this.drizzle.db
      .select({
        ...REFRESH_TOKEN_PUBLIC_COLUMNS,

        // Public User Record
        user: USER_PUBLIC_COLUMNS
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
   * @param userId   - Target user ID.
   * @param password - Already-hashed password (do **not** pass plaintext).
   * @param tx       - Optional transaction; falls back to `drizzle.db`.
   */
  async changePassword(userId: string, password: string, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    await db
      .update(user)
      .set({password})
      .where(eq(user.id, userId));
  }
}
