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
  describe("assertCanModifyRole", () => {
    it("lets an owner change someone else to a role that isn't owner", () => {
      for (const newRole of assignableRoles) {
        expect(() => policy.assertCanModifyRole(request({newRole}))).not.toThrow();
      }
    });

    it.each(nonOwnerRoles)("rejects an actor with the %s role, and logs it as a security problem", (actorRole) => {
      logger.error.mockClear();

      const error = appErrorOfSync(() => policy.assertCanModifyRole(request({actorRole})));

      expect(error).toMatchObject({statusCode: 403, code: "ROLE_MODIFICATION_REQUIRES_OWNER"});
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it("rejects an owner changing their own role", () => {
      const error = appErrorOfSync(() => policy.assertCanModifyRole(request({targetId: OWNER_ID})));

      expect(error).toMatchObject({statusCode: 403, code: "ROLE_SELF_MODIFICATION_NOT_ALLOWED"});
    });

    it("rejects assigning the owner role through the API", () => {
      const error = appErrorOfSync(() => policy.assertCanModifyRole(request({newRole: UserRoleEnum.OWNER})));

      expect(error).toMatchObject({statusCode: 403, code: "OWNER_ROLE_ASSIGNMENT_FORBIDDEN"});
    });

    it("checks the actor's role before anything else", () => {
      // A non-owner acting on themselves should hear "owners only", not "no self changes"
      const error = appErrorOfSync(() =>
        policy.assertCanModifyRole(request({actorRole: UserRoleEnum.USER, targetId: OWNER_ID})),
      );

      expect(error).toMatchObject({code: "ROLE_MODIFICATION_REQUIRES_OWNER"});
    });

    it("reports self modification before owner assignment", () => {
      const error = appErrorOfSync(() =>
        policy.assertCanModifyRole(request({targetId: OWNER_ID, newRole: UserRoleEnum.OWNER})),
      );

      expect(error).toMatchObject({code: "ROLE_SELF_MODIFICATION_NOT_ALLOWED"});
    });
  });

  describe("assertCanDemoteOwner", () => {
    it("rejects a target that currently holds the owner role", () => {
      const error = appErrorOfSync(() =>
        policy.assertCanDemoteOwner({id: TARGET_ID, role: UserRoleEnum.OWNER}),
      );

      expect(error).toMatchObject({statusCode: 403, code: "OWNER_DEMOTION_FORBIDDEN"});
    });

    it.each(nonOwnerRoles)("allows a target with the %s role", (role) => {
      expect(() => policy.assertCanDemoteOwner({id: TARGET_ID, role})).not.toThrow();
    });
  });
});
