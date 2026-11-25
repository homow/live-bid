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
});
