import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {WalletsRepository} from "../wallets.repository";

/**
 * WalletService
 *
 * Handles wallet-related business operations and coordinates
 * wallet creation through the repository layer.
 *
 * @remarks
 * - Wallet creation is triggered asynchronously without blocking
 *   the caller.
 * - Success and failure outcomes are logged with the associated user ID.
 * - Repository failures are handled internally and do not propagate
 *   to the caller.
 *
 * @example
 * // Create a wallet for a newly registered user
 * walletService.createWallet(userId);
 */
@Injectable()
export class WalletService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly walletsRepository: WalletsRepository
  ) {
    this.logger.setContext(WalletsRepository.name);
  }

  /**
   * Creates a wallet for a newly registered user.
   *
   * @remarks
   * - Executes the repository operation in a fire-and-forget manner.
   * - Logs successful creation and any repository failure.
   * - Does not propagate errors to the caller.
   *
   * @param userId - Unique identifier of the wallet owner.
   *
   * @example
   * walletService.createWallet(userId);
   */
  createWallet(userId: string) {
    void this.walletsRepository.createWallet(userId)
      .then(() => {
        this.logger.info({userId}, "Wallet created successfully.");
      })
      .catch(reason => {
        this.logger.error(
          {userId, err: reason as Error},
          `Failed to create wallet for user in ${WalletsRepository.name}`,
        );
      });
  }
}
