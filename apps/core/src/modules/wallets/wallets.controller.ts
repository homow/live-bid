import {WalletService} from "./services";
import {Controller} from "@nestjs/common";
import {AUTH_EVENTS} from "@live-bid/services/events";
import {EventPattern, Payload} from "@nestjs/microservices";

@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @EventPattern(AUTH_EVENTS.USER_REGISTERED)
  createWallet(
    @Payload() userId: string,
  ) {
    return this.walletService.createWallet(userId);
  }
}
