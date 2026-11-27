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
  describe("findOne", () => {
    it("finds a user by id, email and username", async () => {
      const target = await createUser({username: "dpk"});

      await expect(repo.findOne({id: target.id})).resolves.toMatchObject({id: target.id});
      await expect(repo.findOne({email: target.email})).resolves.toMatchObject({id: target.id});
      await expect(repo.findOne({username: "dpk"})).resolves.toMatchObject({id: target.id});
    });

    it("leaves the password out by default", async () => {
      const target = await createUser();

      const found = await repo.findOne({id: target.id});

      expect(found).not.toHaveProperty("password");
    });

    it("includes the password hash when asked for the full row", async () => {
      const target = await createUser({password: "the-hash"});

      const found = await repo.findOne({id: target.id}, false);

      expect(found?.password).toBe("the-hash");
    });

    it("prefers id over email, and email over username", async () => {
      const first = await createUser({username: "first"});
      const second = await createUser({username: "second"});

      const byId = await repo.findOne({id: first.id, email: second.email, username: "second"});
      const byEmail = await repo.findOne({email: first.email, username: "second"});

      expect(byId?.id).toBe(first.id);
      expect(byEmail?.id).toBe(first.id);
    });

    it("returns null for a user that does not exist", async () => {
      await expect(repo.findOne({id: "00000000-0000-7000-8000-000000000000"})).resolves.toBeNull();
    });

    it("refuses to search without any identifier", async () => {
      const error = await appErrorOf(repo.findOne({}));

      expect(error).toMatchObject({statusCode: 500, code: "Missing identifier"});
    });
  });

});
