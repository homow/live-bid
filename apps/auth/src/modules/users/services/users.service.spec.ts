import {beforeEach, describe, expect, it, vi} from "vitest";

import {UsersService} from "./users.service";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {SafeUser} from "@live-bid/services/types";
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

});
