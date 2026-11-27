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

});
