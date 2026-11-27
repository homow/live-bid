import {afterAll, beforeEach, describe, expect, it} from "vitest";

import {UsersRepository} from "./users.repository";
import {user} from "@live-bid/services/database";
import {DrizzleService} from "@live-bid/services/modules";
import {BaseSortByEnum, UserRoleEnum} from "@live-bid/contracts/enums";
import type {FindManyUsersSchemaType} from "@live-bid/contracts/schemas";
import {appErrorOf, pgErrorCode} from "../../../../../test/helpers/errors";
import {closeDb, createUser, resetDb} from "../../../../../test/helpers/db";

/**
 * UsersRepository against a real Postgres (the *_test database).
 */

describe("UsersRepository (real Postgres)", () => {
  const drizzle = new DrizzleService();
  const repo = new UsersRepository(drizzle);

  const loadUser = async (id: string) => {
    const [row] = await drizzle.db.select().from(user).where(eq(user.id, id));
    return row;
  };

  // Any role that isn't the default one, so the tests don't depend on the exact enum values
  const otherRole = Object.values(UserRoleEnum).find((role) => role !== UserRoleEnum.USER) as UserRoleEnum;

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe("insertUser", () => {
    const input = {email: "dpk@example.com", display_name: "dpk", password: "hashed-password"};

    it("returns the safe columns, without password and username", async () => {
      const [created] = await repo.insertUser(input);

      expect(created).toMatchObject({email: input.email, display_name: input.display_name});
      expect(created).toHaveProperty("id");
      expect(created).not.toHaveProperty("password");
      expect(created).not.toHaveProperty("username");
    });

    it("starts every user as an active regular user", async () => {
      const [created] = await repo.insertUser(input);

      expect(created.role).toBe(UserRoleEnum.USER);
      expect(created.is_active).toBe(true);
    });

    it("stores the password exactly as given, since hashing happens in the service", async () => {
      const [created] = await repo.insertUser(input);

      expect((await loadUser(created.id)).password).toBe("hashed-password");
    });

    it("fails with a unique violation for a duplicate email", async () => {
      await repo.insertUser(input);

      await expect(pgErrorCode(repo.insertUser(input))).resolves.toBe("23505");
    });
  });

});
