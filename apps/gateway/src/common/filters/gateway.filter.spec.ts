import {GraphQLError} from "graphql";
import {describe, expect, it} from "vitest";

import {GatewayException} from "./gateway.filter";

describe("GatewayException", () => {
  const exception = new GatewayException({statusCode: 403, code: "ROLE_NOT_ALLOWED", message: "Nope."});

  it("is a GraphQLError, so GraphQL handles it natively", () => {
    expect(exception).toBeInstanceOf(GraphQLError);
    expect(exception).toBeInstanceOf(Error);
  });

  it("uses the payload message", () => {
    expect(exception.message).toBe("Nope.");
  });

  it("exposes code and statusCode to the client through extensions", () => {
    expect(exception.extensions).toEqual({code: "ROLE_NOT_ALLOWED", statusCode: 403});
  });
});
