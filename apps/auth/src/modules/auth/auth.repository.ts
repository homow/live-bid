import {eq} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import type {RefreshTokenInsert} from "@app/auth/types";
import {USER_PUBLIC_COLUMNS} from "../user/user.repository";
import {DrizzleService, refreshToken, user} from "@live-bid/services/database";

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

  async revokeAllUserTokens(userId: string) {
    await this.drizzle.db
      .update(refreshToken)
      .set({is_revoked: true})
      .where(eq(refreshToken.user_id, userId));
  }

  rotateToken(
    oldTokenId: string,
    newTokenData: RefreshTokenInsert
  ) {
    return this.drizzle.db.transaction(async (tx) => {
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
        .where(eq(refreshToken.id, oldTokenId));

      return newToken;
    });
  }
}
