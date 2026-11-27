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
  describe("@Public()", () => {
    it("lets everyone in, even without a user", () => {
      expect(run(Resolver, "open", {})).toBe(true);
    });

    it("only skips the role check when the role guard itself is marked public", () => {
      // This one is public for the access guard only, so a role check still happens
      expect(run(Resolver, "accessOnlyPublic", asRole(USER))).toBe(true);
    });
  });

  describe("a hierarchical @Role (strict: false)", () => {
    it.each([ADMIN, OWNER])("lets %s through", (role) => {
      expect(run(Resolver, "adminAndUp", asRole(role))).toBe(true);
    });

    it("rejects a lower role with 403 ROLE_NOT_ALLOWED", () => {
      const error = gatewayErrorOf(() => run(Resolver, "adminAndUp", asRole(USER)));

      expect(error).toMatchObject({statusCode: 403, code: "ROLE_NOT_ALLOWED"});
      expect(error.message).toContain(USER);
      expect(error.message).toContain(ADMIN);
      expect(error.message).toContain("hierarchical");
    });
  });
  describe("a strict @Role (strict: true)", () => {
    it("lets the exact role through", () => {
      expect(run(Resolver, "adminExactly", asRole(ADMIN))).toBe(true);
    });

    it.each([USER, OWNER])("rejects %s, since only an exact match counts", (role) => {
      const error = gatewayErrorOf(() => run(Resolver, "adminExactly", asRole(role)));

      expect(error).toMatchObject({statusCode: 403, code: "ROLE_NOT_ALLOWED"});
      expect(error.message).toContain("strict");
    });
  });

  describe("a route with no @Role at all", () => {
    it("lets a regular user in", () => {
      expect(run(Resolver, "plain", asRole(USER))).toBe(true);
    });

    // Fails until the default becomes hierarchical, see the notes.
    // If "only plain users on undecorated routes" is on purpose, delete this test.
    it.each([ADMIN, OWNER])("lets %s in too, since higher roles inherit lower ones", (role) => {
      expect(run(Resolver, "plain", asRole(role))).toBe(true);
    });
  });
});
