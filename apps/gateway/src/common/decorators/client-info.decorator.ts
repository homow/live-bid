import {GraphQLContext} from "@app/gateway/types";
import {GqlExecutionContext} from "@nestjs/graphql";
import {normalizeClientInfo} from "@app/gateway/lib";
import {createParamDecorator, ExecutionContext} from "@nestjs/common";

export const NormalizeClientInfo = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const req = gqlCtx.getContext<GraphQLContext>().req;

    return normalizeClientInfo(req.clientInfo);
  }
);
