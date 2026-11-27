import {describe, expect, it} from "vitest";

import {UserRoleEnum} from "@live-bid/contracts/enums";
import {ROLE_HIERARCHY, isRoleAccess} from "./role";

const roles = Object.values(UserRoleEnum) as UserRoleEnum[];

// Every (user role, required role) combination
const pairs = roles.flatMap((userRole) => roles.map((requiredRole) => [userRole, requiredRole] as const));

describe("ROLE_HIERARCHY", () => {

});
