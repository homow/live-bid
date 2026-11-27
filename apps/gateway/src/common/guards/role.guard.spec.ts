import {Reflector} from "@nestjs/core";
import {describe, expect, it} from "vitest";

import {RoleGuard} from "./role.guard";
import {Public, Role} from "../decorators";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {gatewayErrorOf, graphqlContext} from "../../../../../test/helpers/graphql";

/**
 * RoleGuard reads @Public() and @Role() from a resolver, so the tests use a small
 * resolver class wearing those decorators and run the guard against fake GraphQL contexts.
 */

const {USER, ADMIN, OWNER} = UserRoleEnum;

class Resolver {
  @Public()
  open() {}

  @Public({makePublicAccessGuard: true})
  accessOnlyPublic() {}

  @Role({requiredRole: ADMIN, strict: false})
  adminAndUp() {}

  @Role({requiredRole: ADMIN, strict: true})
  adminExactly() {}

  plain() {}
}

@Role({requiredRole: OWNER, strict: false})
class OwnerResolver {
  inherited() {}

  @Role({requiredRole: USER, strict: false})
  overridden() {}
}

const guard = new RoleGuard(new Reflector());

const run = (resolver: typeof Resolver | typeof OwnerResolver, method: string, req: Record<string, unknown>) =>
  guard.canActivate(graphqlContext(resolver, method, req));

const asRole = (role: UserRoleEnum) => ({user: {role}});

describe("RoleGuard", () => {

});
