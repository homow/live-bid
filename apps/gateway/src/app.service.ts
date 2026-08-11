import {Injectable} from '@nestjs/common';
import {BidEvent, WS_EVENTS} from "@live-bid/contracts/";

@Injectable()
export class AppService {
  getHello(): string {
    const f: BidEvent = {
      active: false,
      actionId: "actionId",
      userId: "userId"
    };

    console.log(f);
    console.log(WS_EVENTS);

    return 'Hello World!';
  }
}
