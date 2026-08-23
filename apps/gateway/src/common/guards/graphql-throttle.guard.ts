import {ThrottlerGuard} from "@nestjs/throttler";
import {GraphQLContext} from "@app/gateway/types";
import {GqlExecutionContext} from "@nestjs/graphql";
import {Injectable, ExecutionContext} from '@nestjs/common';

@Injectable()
export class GraphqlThrottleGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const {res, req} = gqlCtx.getContext<GraphQLContext>();
    return {req, res};
  }
}
