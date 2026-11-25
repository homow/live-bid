import {randomBytes} from "node:crypto";
import {eq} from "drizzle-orm";
import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";
import {AuthRepository} from "./auth.repository";
import {DrizzleService} from "@live-bid/services/modules";
import {refreshToken, user} from "@live-bid/services/database";
import {appErrorOf} from "../../../../../test/helpers/errors";
import {closeDb, createUser, resetDb} from "../../../../../test/helpers/db";

/**
 * AuthRepository against a real Postgres (the *_test database).
 * What matters here is the SQL itself: rotation, reuse detection, locking, rollbacks.
 */

const clientInfo = {
  ip: "203.0.113.7",
  browser: "Firefox",
  os: "Linux",
  device: "desktop",
  country: "US",
  city: "Chicago",
  lang: "en",
};

const logger = {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()};

const randomHash = () => randomBytes(32).toString("hex");
const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000);

describe("AuthRepository (real Postgres)", () => {
  const drizzle = new DrizzleService();
  const repo = new AuthRepository(logger as never, drizzle);

  /** Puts a session straight into the table, so the tests don't depend on insertRefreshToken */
  const seedToken = async (userId: string, overrides: Partial<typeof refreshToken.$inferInsert> = {}) => {
    const [row] = await drizzle.db
      .insert(refreshToken)
      .values({
        user_id: userId,
        token_hash: randomHash(),
        expires_in: inOneHour(),
        client_info: clientInfo,
        ...overrides,
      })
      .returning();

    return row;
  };

  const loadToken = async (id: string) => {
    const [row] = await drizzle.db.select().from(refreshToken).where(eq(refreshToken.id, id));
    return row;
  };

  const countTokens = async () => (await drizzle.db.select().from(refreshToken)).length;

  const newSession = (userId: string) => ({
    user_id: userId,
    token_hash: randomHash(),
    expires_in: inOneHour(),
    client_info: clientInfo,
    remember_me: false,
    replace_by_token_id: null,
  });

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe("insertRefreshToken", () => {
    it("stores the session, not revoked by default", async () => {
      const owner = await createUser();
      const tokenHash = randomHash();

      await repo.insertRefreshToken({...newSession(owner.id), token_hash: tokenHash, remember_me: true});

      const [row] = await repo.findRefreshRecord(tokenHash);
      expect(row).toMatchObject({
        user_id: owner.id,
        token_hash: tokenHash,
        is_revoked: false,
        remember_me: true,
      });
    });
  });

  describe("findRefreshRecord", () => {
    it("returns the public columns only", async () => {
      const owner = await createUser();
      const session = await seedToken(owner.id);

      const [row] = await repo.findRefreshRecord(session.token_hash);

      expect(row.id).toBe(session.id);
      expect(row).not.toHaveProperty("client_info");
    });

    it("returns nothing for an unknown hash", async () => {
      await expect(repo.findRefreshRecord(randomHash())).resolves.toEqual([]);
    });

    it("works inside a transaction", async () => {
      const owner = await createUser();
      const session = await seedToken(owner.id);

      const rows = await drizzle.db.transaction((tx) => repo.findRefreshRecord(session.token_hash, tx));

      expect(rows).toHaveLength(1);
    });
  });

  describe("revokeAllUserTokens", () => {
    it("revokes every session of that user and leaves other users alone", async () => {
      const alice = await createUser();
      const bob = await createUser();
      const aliceTokens = [await seedToken(alice.id), await seedToken(alice.id)];
      const bobToken = await seedToken(bob.id);

      await repo.revokeAllUserTokens(alice.id);

      for (const token of aliceTokens) {
        expect((await loadToken(token.id)).is_revoked).toBe(true);
      }
      expect((await loadToken(bobToken.id)).is_revoked).toBe(false);
    });

    it("is rolled back together with the transaction it ran in", async () => {
      const owner = await createUser();
      const session = await seedToken(owner.id);

      await expect(
        drizzle.db.transaction(async (tx) => {
          await repo.revokeAllUserTokens(owner.id, tx);
          throw new Error("rollback please");
        }),
      ).rejects.toThrow("rollback please");

      expect((await loadToken(session.id)).is_revoked).toBe(false);
    });
  });
  describe("rotateToken", () => {
    it("revokes the old session, inserts the new one and links them", async () => {
      const owner = await createUser();
      const old = await seedToken(owner.id);
      const next = newSession(owner.id);

      const created = await drizzle.db.transaction((tx) => repo.rotateToken(old.id, next, tx));

      const oldAfter = await loadToken(old.id);
      const newRow = await loadToken(created.id);

      expect(oldAfter.is_revoked).toBe(true);
      expect(oldAfter.replace_by_token_id).toBe(created.id);
      expect(newRow).toMatchObject({token_hash: next.token_hash, is_revoked: false, user_id: owner.id});
    });

    it("throws REFRESH_TOKEN_REUSE for an already revoked token and inserts nothing", async () => {
      const owner = await createUser();
      const old = await seedToken(owner.id, {is_revoked: true});

      const error = await appErrorOf(
        drizzle.db.transaction((tx) => repo.rotateToken(old.id, newSession(owner.id), tx)),
      );

      expect(error).toMatchObject({
        statusCode: 401,
        code: "REFRESH_TOKEN_REUSE",
        meta: {clearAuthCookies: true},
      });
      expect(await countTokens()).toBe(1);
    });

    it("lets exactly one of two parallel rotations of the same token win", async () => {
      const owner = await createUser();
      const old = await seedToken(owner.id);

      const rotate = () => drizzle.db.transaction((tx) => repo.rotateToken(old.id, newSession(owner.id), tx));
      const results = await Promise.allSettled([rotate(), rotate()]);

      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);

      // The old session plus exactly one new one
      expect(await countTokens()).toBe(2);
    });
  });

});
