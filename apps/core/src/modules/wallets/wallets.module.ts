import {Module} from "@nestjs/common";
import {WalletService} from "./services";
import {WalletController} from "./wallets.controller";
import {WalletsRepository} from './wallets.repository';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletsRepository,
  ],
})
export class WalletsModule {}
