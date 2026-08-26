import {GqlExecutionContext} from "@nestjs/graphql";
import type {ExecutionContext} from "@nestjs/common";
import type {GraphQLContext} from "@app/gateway/types";

export function getRequestResponse(context: ExecutionContext) {
  const gqlCtx = GqlExecutionContext.create(context);
  const {res, req} = gqlCtx.getContext<GraphQLContext>();
  return {req, res};
}
