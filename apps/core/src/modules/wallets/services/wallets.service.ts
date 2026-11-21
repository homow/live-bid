import {Injectable} from "@nestjs/common";

@Injectable()
export class WalletService {
  createWallet(userId: string) {
    console.log(userId);
  }
}
