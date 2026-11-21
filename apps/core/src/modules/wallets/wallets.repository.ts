import {Injectable} from "@nestjs/common";
import {wallet} from "@live-bid/services/database";
import {DrizzleService} from "@live-bid/services/modules";

/**
 * WalletsRepository
 *
 * Provides database access operations for user wallets.
 *
 * @remarks
 * - Uses Drizzle ORM for database interactions.
 * - Creates wallet records associated with their respective users.
 * - Keeps database queries isolated from business logic.
 *
 * @example
 * // Create a wallet record for a user
 * await walletsRepository.createWallet(userId);
 */
@Injectable()
export class WalletsRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  /**
   * Creates a wallet record associated with the specified user.
   *
   * @param user_id - Unique identifier of the wallet owner.
   * @returns A promise that resolves when the database insertion completes.
   *
   * @throws Propagates database errors if the insertion fails.
   *
   * @example
   * await walletsRepository.createWallet(userId);
   */
  async createWallet(user_id: string) {
    await this.drizzle.db
      .insert(wallet)
      .values({user_id});
  }
}
