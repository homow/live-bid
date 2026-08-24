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
}
