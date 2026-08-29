import type {Request} from "express";
import {GqlExecutionContext} from "@nestjs/graphql";
import type {ExecutionContext} from "@nestjs/common";
import type {GraphQLContext} from "@app/gateway/types";

export function getRequestResponse<T extends Request = Request, U extends ExecutionContext = ExecutionContext>(context: U) {
  const gqlCtx = GqlExecutionContext.create(context);
  const {res, req} = gqlCtx.getContext<GraphQLContext<T>>();
  return {req, res};
}
