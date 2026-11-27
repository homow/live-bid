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
const passportGuard = Object.getPrototypeOf(AccessTokenGuard.prototype) as {canActivate: () => unknown};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AccessTokenGuard", () => {

});
