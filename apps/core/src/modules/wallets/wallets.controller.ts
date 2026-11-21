import {WalletService} from "./services";
import {Controller} from "@nestjs/common";
import {AUTH_EVENTS} from "@live-bid/services/events";
import {EventPattern, Payload} from "@nestjs/microservices";

/**
 * WalletController
 *
 * Handles incoming wallet-related events and delegates
 * wallet operations to the service layer.
 *
 * @remarks
 * - Listens for the `USER_REGISTERED` authentication event.
 * - Automatically triggers wallet creation when a new user is registered.
 * - Keeps event handling separate from wallet business logic.
 *
 * @example
 * // Triggered automatically through the event transport
 * @EventPattern(AUTH_EVENTS.USER_REGISTERED)
 * createWallet(@Payload() userId: string) {
 *   return this.walletService.createWallet(userId);
 * }
 */
@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  /**
   * Handles the user registration event and initiates wallet creation.
   *
   * @param userId - Unique identifier of the newly registered user.
   *
   * @remarks
   * Delegates wallet creation to `WalletService` without implementing
   * business logic at the event-handling layer.
   *
   * @example
   * // Triggered by AUTH_EVENTS.USER_REGISTERED
   * createWallet(userId);
   */
  @EventPattern(AUTH_EVENTS.USER_REGISTERED)
  createWallet(
    @Payload() userId: string,
  ) {
    return this.walletService.createWallet(userId);
  }
}
