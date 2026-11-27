import {describe, expect, it} from "vitest";
import {ROLE_HIERARCHY, isRoleAccess} from "./role";
import {UserRoleEnum} from "@live-bid/contracts/enums";

const roles = Object.values(UserRoleEnum) as UserRoleEnum[];

// Every (user role, required role) combination
const pairs = roles.flatMap((userRole) => roles.map((requiredRole) => [userRole, requiredRole] as const));

/*
 * **ROLE_HIERARCHY**
 */
describe("ROLE_HIERARCHY", () => {
  it("has a level for every role, otherwise a new role would be denied everywhere without a sound", () => {
    for (const role of roles) {
      expect(ROLE_HIERARCHY[role]).toEqual(expect.any(Number));
    }
  });

  it("gives every role its own level", () => {
    const levels = Object.values(ROLE_HIERARCHY);

    expect(new Set(levels).size).toBe(levels.length);
  });

  it("ranks USER below ADMIN below OWNER", () => {
    expect(ROLE_HIERARCHY[UserRoleEnum.USER]).toBeLessThan(ROLE_HIERARCHY[UserRoleEnum.ADMIN]);
    expect(ROLE_HIERARCHY[UserRoleEnum.ADMIN]).toBeLessThan(ROLE_HIERARCHY[UserRoleEnum.OWNER]);
  });
});

/*
 * **ROLE_HIERARCHY**
 */
describe("isRoleAccess", () => {
  const level = (role: UserRoleEnum) => ROLE_HIERARCHY[role];

  describe("hierarchical (the default)", () => {
    it.each(pairs)("user %s, required %s", (userRole, requiredRole) => {
      expect(isRoleAccess({userRole, requiredRole})).toBe(level(userRole) >= level(requiredRole));
      expect(isRoleAccess({userRole, requiredRole, strict: false})).toBe(level(userRole) >= level(requiredRole));
    });

    it("lets an admin use a user route and keeps a user out of an admin route", () => {
      expect(isRoleAccess({userRole: UserRoleEnum.ADMIN, requiredRole: UserRoleEnum.USER})).toBe(true);
      expect(isRoleAccess({userRole: UserRoleEnum.USER, requiredRole: UserRoleEnum.ADMIN})).toBe(false);
    });
  });

  describe("strict", () => {
    it.each(pairs)("user %s, required %s", (userRole, requiredRole) => {
      expect(isRoleAccess({userRole, requiredRole, strict: true})).toBe(userRole === requiredRole);
    });
  });
});
