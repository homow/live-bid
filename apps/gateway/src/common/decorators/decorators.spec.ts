import "reflect-metadata";
import {describe, expect, it} from "vitest";

import {UserRoleEnum} from "@live-bid/contracts/enums";
import {IS_PUBLIC_KEY, Public, ROLE_METADATA, Role} from "./index";

/**
 * The decorators only write metadata, but the guards depend on exact keys and shapes.
 */

class Resolver {
  @Public()
  fullyPublic() {}

  @Public({makePublicAccessGuard: true})
  accessOnly() {}

  @Public({makePublicRoleGuard: true, makePublicAccessGuard: false})
  roleOnly() {}

  @Role({requiredRole: UserRoleEnum.ADMIN, strict: true})
  strictAdmin() {}
}

@Role({requiredRole: UserRoleEnum.OWNER, strict: false})
class OwnerOnly {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const metadata = (key: string, target: object) => Reflect.getMetadata(key, target);

describe("@Public()", () => {
  it("bypasses both guards by default", () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(metadata(IS_PUBLIC_KEY, Resolver.prototype.fullyPublic)).toEqual({
      makePublicRoleGuard: true,
      makePublicAccessGuard: true,
    });
  });

  it("stores exactly what it was given, so a partial config leaves the other guard on", () => {
    // Only the access guard is bypassed: makePublicRoleGuard is simply missing, which means false
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(metadata(IS_PUBLIC_KEY, Resolver.prototype.accessOnly)).toEqual({makePublicAccessGuard: true});
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(metadata(IS_PUBLIC_KEY, Resolver.prototype.roleOnly)).toEqual({
      makePublicRoleGuard: true,
      makePublicAccessGuard: false,
    });
  });
});
