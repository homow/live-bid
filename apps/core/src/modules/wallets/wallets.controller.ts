import {WalletService} from "./services";
import {Controller} from "@nestjs/common";
import {EventPattern, Payload} from "@nestjs/microservices";

@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @EventPattern("user.registered")
  createWallet(
    @Payload() {userId}: { userId: string; },
  ) {
    console.log("In Wallet Controller: ", userId);
    return this.walletService.createWallet(userId);
  }
}
