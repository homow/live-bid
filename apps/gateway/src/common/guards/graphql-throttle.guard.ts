import {Injectable} from '@nestjs/common';
import {getRequestResponse} from "@app/gateway/lib";
import {ThrottlerGuard, ThrottlerLimitDetail} from "@nestjs/throttler";

@Injectable()
export class GraphqlThrottleGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: Parameters<ThrottlerGuard['handleRequest']>[0],
  ) {
    const {context, ttl, limit, blockDuration, generateKey, throttler} = requestProps;

    const {req} = getRequestResponse(context);
    const tracker = await this.getTracker(req);
    const key = generateKey(context, tracker, throttler.name || "throttler");

    const {totalHits, timeToExpire, isBlocked, timeToBlockExpire} = await this.storageService.increment(key, ttl, limit, blockDuration, throttler.name || "throttler");

    if (isBlocked) {
      await this.throwThrottlingException(context, {
        ttl,
        key,
        limit,
        tracker,
        totalHits,
        isBlocked,
        timeToExpire,
        timeToBlockExpire,
      } satisfies ThrottlerLimitDetail);
    }

    return totalHits <= limit;
  }
}
