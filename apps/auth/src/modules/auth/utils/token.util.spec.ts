import {TokenUtil} from "./token.util";
import {JwtService} from "@nestjs/jwt";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {vi, afterEach, describe, it, expect} from "vitest";

/**
 * Unit tests for TokenUtil.
 *
 * JwtService is the real one, so we can verify the tokens it signs.
 * Config and cache are small fakes.
 */
const SECRET = "test-secret-that-is-long-enough-for-hs256";

const HOUR_MS = 60 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * HOUR_MS;
const SEVEN_DAYS_MS = 7 * 24 * HOUR_MS;

function setup(env: Record<string, string | undefined> = {}) {
  const values: Record<string, string | undefined> = {JWT_SECRET: SECRET, ...env};

  const config = {get: vi.fn((key: string) => values[key])};
  const cache = {setPwdTokenAtomic: vi.fn(), getDel: vi.fn()};
  const jwt = new JwtService();

  const util = new TokenUtil(config as never, jwt, cache as never);

  return {util, jwt, cache};
}

afterEach(() => {
  vi.useRealTimers();
});

describe("TokenUtil", () => {
  describe("getRefreshDate", () => {
    it("is 12 hours by default and 7 days with remember me", () => {
      const {util} = setup();

      expect(util.getRefreshDate(false)).toBe(TWELVE_HOURS_MS);
      expect(util.getRefreshDate(true)).toBe(SEVEN_DAYS_MS);
    });
  });
});
