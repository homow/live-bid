import {describe, expect, it} from "vitest";

import {UserRoleEnum} from "@live-bid/contracts/enums";
import {ROLE_HIERARCHY, isRoleAccess} from "./role";

const roles = Object.values(UserRoleEnum) as UserRoleEnum[];

// Every (user role, required role) combination
const pairs = roles.flatMap((userRole) => roles.map((requiredRole) => [userRole, requiredRole] as const));

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
