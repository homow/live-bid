import {beforeEach, describe, expect, it, vi} from "vitest";

import {RolesService} from "./roles.service";
import {RolesPolicy} from "./roles-policy.service";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {appErrorOf} from "../../../../../../test/helpers/errors";

/**
 * RolesService with the repository, the cache and the transaction faked.
 * The policy is the real RolesPolicy, so the rules themselves are exercised too.
 */

const roles = Object.values(UserRoleEnum) as UserRoleEnum[];
const assignable = roles.find((role) => role !== UserRoleEnum.USER && role !== UserRoleEnum.OWNER);

if (!assignable) {
  throw new Error("UserRoleEnum needs a role besides USER and OWNER for these tests");
}

const OWNER_ID = "01900000-0000-7000-8000-0000000000a1";
const TARGET_ID = "01900000-0000-7000-8000-0000000000b2";

// Stands in for the drizzle transaction object, we only check it gets passed along
const TX = {tag: "tx"};

const request = (overrides: { actorRole?: UserRoleEnum; targetId?: string; newRole?: UserRoleEnum } = {}) => ({
  actor: {id: OWNER_ID, role: overrides.actorRole ?? UserRoleEnum.OWNER},
  target: {id: overrides.targetId ?? TARGET_ID, newRole: overrides.newRole ?? assignable},
});

function setup() {
  const logger = {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()};
  const drizzle = {db: {transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(TX))}};
  const usersRepository = {findOne: vi.fn(), updateRole: vi.fn().mockResolvedValue(undefined)};
  const usersCache = {deleteUserCache: vi.fn().mockResolvedValue(1)};

  usersRepository.findOne.mockResolvedValue({id: TARGET_ID, role: UserRoleEnum.USER});

  const service = new RolesService(
    logger as never,
    drizzle as never,
    new RolesPolicy(logger as never),
    usersRepository as never,
    usersCache as never,
  );

  return {service, drizzle, usersRepository, usersCache};
}

describe("RolesService.modifyRole", () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  it("changes the role and returns a summary", async () => {
    await expect(ctx.service.modifyRole(request())).resolves.toEqual({
      userId: TARGET_ID,
      newRole: assignable,
      result: "Target user role updated successfully.",
    });

    expect(ctx.usersRepository.updateRole).toHaveBeenCalledWith(TARGET_ID, assignable, TX);
  });

  it("loads the target with a lock, inside the transaction", async () => {
    await ctx.service.modifyRole(request());

    expect(ctx.drizzle.db.transaction).toHaveBeenCalledWith(expect.any(Function), {
      accessMode: "read write",
      isolationLevel: "read committed",
    });
    expect(ctx.usersRepository.findOne).toHaveBeenCalledWith({lock: true, id: TARGET_ID}, true, TX);
  });

  it("clears the target's cache so the new role shows up right away", async () => {
    await ctx.service.modifyRole(request());

    expect(ctx.usersCache.deleteUserCache).toHaveBeenCalledWith(TARGET_ID);
  });

  it("clears the cache only after the transaction has committed", async () => {
    let committed = false;
    let committedWhenCacheWasCleared: boolean | undefined;

    ctx.drizzle.db.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => {
      const result = await callback(TX);
      committed = true;
      return result;
    });
    ctx.usersCache.deleteUserCache.mockImplementation(async () => {
      committedWhenCacheWasCleared = committed;
      return 1;
    });

    await ctx.service.modifyRole(request());

    expect(committedWhenCacheWasCleared).toBe(true);
  });
});
