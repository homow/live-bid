import {Reflector} from "@nestjs/core";
import {afterEach, describe, expect, it, vi} from "vitest";

import {Public} from "../decorators";
import {AccessTokenGuard} from "./access.guard";
import {gatewayErrorOf, graphqlContext} from "../../../../../test/helpers/graphql";

/**
 * AccessTokenGuard decides "public or not" itself and hands everything else to Passport.
 * Passport's own canActivate is replaced by a spy, so these tests don't need a real token.
 * (The token checking itself is covered in access.strategy.spec.ts.)
 */

class Resolver {
  @Public()
  open() {}

  @Public({makePublicRoleGuard: true})
  publicForRoleGuardOnly() {}

  guarded() {}
}

const guard = new AccessTokenGuard(new Reflector());

// AccessTokenGuard extends the guard class Passport builds, that's where canActivate lives
const passportGuard = Object.getPrototypeOf(AccessTokenGuard.prototype) as { canActivate: () => unknown };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AccessTokenGuard", () => {
  describe("canActivate", () => {
    it("lets a @Public() route through without asking Passport", () => {
      const passport = vi.spyOn(passportGuard, "canActivate");

      expect(guard.canActivate(graphqlContext(Resolver, "open"))).toBe(true);
      expect(passport).not.toHaveBeenCalled();
    });

    it("hands a normal route over to Passport and returns its answer", () => {
      const passport = vi.spyOn(passportGuard, "canActivate").mockReturnValue(true);
      const context = graphqlContext(Resolver, "guarded");

      expect(guard.canActivate(context)).toBe(true);
      expect(passport).toHaveBeenCalledWith(context);
    });

    it("passes a rejection from Passport on as it is", () => {
      vi.spyOn(passportGuard, "canActivate").mockReturnValue(false);

      expect(guard.canActivate(graphqlContext(Resolver, "guarded"))).toBe(false);
    });

    it("still checks the token on a route that is only public for the role guard", async () => {
      const passport = vi.spyOn(passportGuard, "canActivate").mockReturnValue(true);

      await guard.canActivate(graphqlContext(Resolver, "publicForRoleGuardOnly"));

      expect(passport).toHaveBeenCalledTimes(1);
    });
  });
  describe("handleRequest", () => {
    const user = {userId: "user-1", role: "USER"};
    const context = graphqlContext(Resolver, "guarded");

    it("returns the user Passport resolved", () => {
      expect(guard.handleRequest(null as never, user, undefined, context)).toBe(user);
    });

    it.each([
      ["Passport reports an error", new Error("jwt expired"), false],
      ["there is no user", null, null],
      ["the user is false", null, false],
    ])("answers 401 ACCESS_TOKEN_EXPIRED when %s", (_label, error, resolvedUser) => {
      const result = gatewayErrorOf(() => guard.handleRequest(error as never, resolvedUser as never, undefined, context));

      expect(result).toMatchObject({statusCode: 401, code: "ACCESS_TOKEN_EXPIRED"});
    });
  });

  describe("getRequest", () => {
    it("takes the request out of the GraphQL context", () => {
      const req = {headers: {}};

      expect(guard.getRequest(graphqlContext(Resolver, "guarded", req))).toBe(req);
    });
  });

});
