import {UsersService} from "./users.service";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {SafeUser} from "@live-bid/services/types";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {appErrorOf} from "../../../../../../test/helpers/errors";

/**
 * UsersService with the repository and the cache layer faked.
 */
const USER_ID = "01900000-0000-7000-8000-000000000001";

const safeUser: SafeUser = {
  id: USER_ID,
  role: UserRoleEnum.USER,
  email: "dpk@example.com",
  username: null,
  is_active: true,
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
  display_name: "dpk",
};

function setup() {
  const usersRepository = {findOne: vi.fn(), updateProfile: vi.fn().mockResolvedValue(undefined)};
  const usersCache = {
    getOrSetUserCache: vi.fn().mockResolvedValue(safeUser),
    deleteUserCache: vi.fn().mockResolvedValue(1),
    incrementUserListVersion: vi.fn(),
    getOrSetCacheUserList: vi.fn(),
  };

  const service = new UsersService(usersRepository as never, usersCache as never);

  return {service, usersRepository, usersCache};
}

describe("UsersService", () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  // ============================
  // |     getPublicProfile     |
  // ============================
  describe("getPublicProfile", () => {
    it("returns the four public fields and nothing else", async () => {
      await expect(ctx.service.getPublicProfile(USER_ID)).resolves.toEqual({
        role: safeUser.role,
        username: safeUser.username,
        is_active: safeUser.is_active,
        display_name: safeUser.display_name,
      });
    });

    it("never leaks the email, the id or the timestamps", async () => {
      const profile = await ctx.service.getPublicProfile(USER_ID);

      expect(profile).not.toHaveProperty("email");
      expect(profile).not.toHaveProperty("id");
      expect(profile).not.toHaveProperty("created_at");
    });

    it("reads through the cache", async () => {
      await ctx.service.getPublicProfile(USER_ID);

      expect(ctx.usersCache.getOrSetUserCache).toHaveBeenCalledWith(USER_ID);
    });
  });

  // ============================
  // |      getMyProfile        |
  // ============================
  describe("getMyProfile", () => {
    it("returns the user from the cache layer as it is", async () => {
      await expect(ctx.service.getMyProfile(USER_ID)).resolves.toBe(safeUser);
    });
  });

  // ============================
  // |     updateProfile        |
  // ============================
  describe("updateProfile", () => {
    it("writes only the fields that actually changed", async () => {
      await ctx.service.updateProfile({
        userId: USER_ID,
        updatableData: {username: "dpk_new", display_name: "dpk"},
      });

      expect(ctx.usersRepository.updateProfile).toHaveBeenCalledWith(USER_ID, {username: "dpk_new"});
    });

    it("returns the changed fields, not the whole profile", async () => {
      await expect(
        ctx.service.updateProfile({userId: USER_ID, updatableData: {display_name: "New Name"}}),
      ).resolves.toEqual({display_name: "New Name"});
    });

    it("clears the user's cache and the cached users lists", async () => {
      await ctx.service.updateProfile({userId: USER_ID, updatableData: {display_name: "New Name"}});

      expect(ctx.usersCache.deleteUserCache).toHaveBeenCalledWith(USER_ID);
      expect(ctx.usersCache.incrementUserListVersion).toHaveBeenCalledTimes(1);
    });

    it.each([
      ["nothing is sent", {}],
      ["the values are the same as now", {display_name: "dpk", username: null}],
    ])("answers 400 NO_CHANGES when %s, and writes nothing", async (_label, updatableData) => {
      const error = await appErrorOf(ctx.service.updateProfile({userId: USER_ID, updatableData}));

      expect(error).toMatchObject({statusCode: 400, code: "NO_CHANGES"});
      expect(ctx.usersRepository.updateProfile).not.toHaveBeenCalled();
      expect(ctx.usersCache.deleteUserCache).not.toHaveBeenCalled();
      expect(ctx.usersCache.incrementUserListVersion).not.toHaveBeenCalled();
    });

    it("answers 409 when the username is taken, and keeps the caches", async () => {
      const taken = Object.assign(new Error("update failed"), {cause: {code: "23505"}});
      ctx.usersRepository.updateProfile.mockRejectedValue(taken);

      const error = await appErrorOf(
        ctx.service.updateProfile({userId: USER_ID, updatableData: {username: "taken"}}),
      );

      expect(error).toMatchObject({statusCode: 409, code: "CONFLICT"});
      expect(ctx.usersCache.deleteUserCache).not.toHaveBeenCalled();
      expect(ctx.usersCache.incrementUserListVersion).not.toHaveBeenCalled();
    });

    it("lets unknown errors through untouched", async () => {
      ctx.usersRepository.updateProfile.mockRejectedValue(new Error("boom"));

      await expect(
        ctx.service.updateProfile({userId: USER_ID, updatableData: {username: "x"}}),
      ).rejects.toThrow("boom");
    });
  });

  // ============================
  // |        findOne           |
  // ============================
  describe("findOne", () => {
    it("uses the cache when it gets a user id", async () => {
      await expect(ctx.service.findOne({user_id: USER_ID})).resolves.toBe(safeUser);

      expect(ctx.usersCache.getOrSetUserCache).toHaveBeenCalledWith(USER_ID);
      expect(ctx.usersRepository.findOne).not.toHaveBeenCalled();
    });

    it("prefers the user id over email and username", async () => {
      await ctx.service.findOne({user_id: USER_ID, email: "other@example.com", username: "other"});

      expect(ctx.usersCache.getOrSetUserCache).toHaveBeenCalledTimes(1);
      expect(ctx.usersRepository.findOne).not.toHaveBeenCalled();
    });

    it("goes to the repository for an email or a username", async () => {
      ctx.usersRepository.findOne.mockResolvedValue(safeUser);

      await expect(ctx.service.findOne({email: safeUser.email})).resolves.toBe(safeUser);

      expect(ctx.usersRepository.findOne).toHaveBeenCalledWith({email: safeUser.email, username: undefined});
      expect(ctx.usersCache.getOrSetUserCache).not.toHaveBeenCalled();
    });

    it("answers 404 when the repository finds nobody", async () => {
      ctx.usersRepository.findOne.mockResolvedValue(null);

      const error = await appErrorOf(ctx.service.findOne({username: "ghost"}));

      expect(error).toMatchObject({statusCode: 404, code: "NOT_FOUND"});
    });
  });

  // ============================
  // |        findMany          |
  // ============================
  describe("findMany", () => {
    it("hands the options to the cached list lookup and returns its result", async () => {
      const options = {limit: 10, offset: 0, orderBy: "created_at", sortBy: "desc"} as never;
      ctx.usersCache.getOrSetCacheUserList.mockResolvedValue([safeUser]);

      await expect(ctx.service.findMany(options)).resolves.toEqual([safeUser]);

      expect(ctx.usersCache.getOrSetCacheUserList).toHaveBeenCalledWith(options);
    });
  });
});
