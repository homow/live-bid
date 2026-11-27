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

});
