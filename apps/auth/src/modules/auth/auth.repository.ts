import {eq} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import type {RefreshTokenInsert} from "@app/auth/types";
import {DrizzleService, refreshToken} from "@live-bid/services/database";

@Injectable()
export class AuthRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  insertRefreshToken(data: RefreshTokenInsert) {
    return this.drizzle.db
      .insert(refreshToken)
      .values(data);
  }

  findRefreshRecord(tokenHash: string) {
    return this.drizzle.db
      .select({
        id: refreshToken.id,
        user_id: refreshToken.user_id,
        token_hash: refreshToken.token_hash,
        is_revoked: refreshToken.is_revoked,
        expires_in: refreshToken.expires_in,
        created_at: refreshToken.created_at,
        updated_at: refreshToken.updated_at,
        remember_me: refreshToken.remember_me,
        replace_by_token_id: refreshToken.replace_by_token_id,
      })
      .from(refreshToken)
      .where(eq(refreshToken.token_hash, tokenHash));
  }
}
