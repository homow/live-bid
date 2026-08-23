import {GraphQLContext} from "@app/gateway/types";
import {GqlExecutionContext} from "@nestjs/graphql";
import {Injectable, ExecutionContext} from '@nestjs/common';
import {ThrottlerGuard, ThrottlerLimitDetail} from "@nestjs/throttler";

@Injectable()
export class GraphqlThrottleGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const {res, req} = gqlCtx.getContext<GraphQLContext>();
    return {req, res};
  }

  protected async handleRequest(
    requestProps: Parameters<ThrottlerGuard['handleRequest']>[0],
  ) {
    const {context, ttl, limit, blockDuration, generateKey, throttler} = requestProps;

    const {req} = this.getRequestResponse(context);
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
