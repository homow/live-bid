import {Module} from "@nestjs/common";
import {WalletService} from "./services";
import {WalletController} from "./wallets.controller";

@Module({
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletsModule {}
