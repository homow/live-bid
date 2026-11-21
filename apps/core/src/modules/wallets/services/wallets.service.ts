import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {WalletsRepository} from "../wallets.repository";

@Injectable()
export class WalletService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly walletsRepository: WalletsRepository
  ) {
    this.logger.setContext(WalletsRepository.name);
  }

  createWallet(userId: string) {
    void this.walletsRepository.createWallet(userId).catch(reason => {
      this.logger.error(
        {userId, err: reason as Error},
        `Failed to create wallet for user in ${WalletsRepository.name}`,
      );
    });
  }
}
