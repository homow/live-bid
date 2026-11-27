import {describe, expect, it, vi} from "vitest";

import {RolesPolicy} from "./roles-policy.service";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {appErrorOfSync} from "../../../../../../test/helpers/errors";

/**
 * RolesPolicy is pure (no db, no transaction), so these tests just feed it
 * actors and targets and look at what it throws.
 */

const logger = {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()};
const policy = new RolesPolicy(logger as never);

const roles = Object.values(UserRoleEnum) as UserRoleEnum[];
const nonOwnerRoles = roles.filter((role) => role !== UserRoleEnum.OWNER);
const assignableRoles = roles.filter((role) => role !== UserRoleEnum.OWNER);

const OWNER_ID = "01900000-0000-7000-8000-0000000000a1";
const TARGET_ID = "01900000-0000-7000-8000-0000000000b2";

const request = (overrides: { actorRole?: UserRoleEnum; actorId?: string; targetId?: string; newRole?: UserRoleEnum } = {}) => ({
  actor: {id: overrides.actorId ?? OWNER_ID, role: overrides.actorRole ?? UserRoleEnum.OWNER},
  target: {id: overrides.targetId ?? TARGET_ID, newRole: overrides.newRole ?? assignableRoles[0]},
});

describe("RolesPolicy", () => {

});
