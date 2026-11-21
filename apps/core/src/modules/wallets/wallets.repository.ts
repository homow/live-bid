import {Injectable} from "@nestjs/common";
import {wallet} from "@live-bid/services/database";
import {DrizzleService} from "@live-bid/services/modules";

@Injectable()
export class WalletsRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createWallet(user_id: string) {
    await this.drizzle.db
      .insert(wallet)
      .values({user_id});
  }
}
