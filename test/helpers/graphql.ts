import {expect} from "vitest";
import {GatewayException} from "@app/gateway/common/filters";
import {ExecutionContextHost} from "@nestjs/core/helpers/execution-context-host";

type Constructor = abstract new (...args: never[]) => object;

/**
 * Builds the execution context Nest hands to a guard for a GraphQL resolver method.
 * `req` is what the guard will find under the GraphQL context.
 */
export function graphqlContext(resolver: Constructor, method: string, req: Record<string, unknown> = {}) {
  const handler = (resolver.prototype as Record<string, unknown>)[method] as (...args: unknown[]) => unknown;

  // GraphQL resolvers receive (root, args, context, info)
  const context = new ExecutionContextHost([{}, {}, {req, res: {}}, {}], resolver as never, handler);
  context.setType("graphql");

  return context;
}

/** Runs a call that should throw a GatewayException and returns its message, code and statusCode */
export function gatewayErrorOf(call: () => unknown) {
  try {
    call();
  } catch (error) {
    expect(error).toBeInstanceOf(GatewayException);

    const {message, extensions} = error as GatewayException;
    return {message, ...extensions} as {message: string; code: string; statusCode: number};
  }

  throw new Error("Expected the call to throw a GatewayException, but it returned normally");
}
