import {TokenUtil} from "./token.util";
import {JwtService} from "@nestjs/jwt";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {vi, afterEach, describe, it, expect} from "vitest";
import {AccessTokenPayload} from "@live-bid/services/types";
import {createHash} from "node:crypto";

/**
 * Unit tests for TokenUtil.
 *
 * JwtService is the real one, so we can verify the tokens it signs.
 * Config and cache are small fakes.
 */
const SECRET = "test-secret-that-is-long-enough-for-hs256";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const HOUR_MS = 60 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * HOUR_MS;
const SEVEN_DAYS_MS = 7 * 24 * HOUR_MS;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function setup(env: Record<string, string | undefined> = {}) {
  const values: Record<string, string | undefined> = {JWT_SECRET: SECRET, ...env};

  const config = {get: vi.fn((key: string) => values[key])};
  const cache = {setPwdTokenAtomic: vi.fn(), getDel: vi.fn()};
  const jwt = new JwtService();

  const util = new TokenUtil(config as never, jwt, cache as never);

  return {util, jwt, cache};
}

const payload: AccessTokenPayload = {
  sub: "user-1",
  role: UserRoleEnum.USER,
  jti: "jti-1",
};

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

  describe("getAccessDate", () => {
    it("falls back to 15 minutes", () => {
      const {util} = setup();

      expect(util.getAccessDate()).toBe(FIFTEEN_MINUTES_MS);
    });

    it("follows JWT_EXPIRES when it is set", () => {
      const {util} = setup({JWT_EXPIRES: "1h"});

      expect(util.getAccessDate()).toBe(HOUR_MS);
    });
  });

  describe("getCookieOptions", () => {
    it("is strict and secure in production", () => {
      const {util} = setup({NODE_ENV: "production"});

      expect(util.getCookieOptions("access")).toEqual({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: FIFTEEN_MINUTES_MS,
      });
    });

    it("is lax and not secure outside production, so local http works", () => {
      const {util} = setup({NODE_ENV: "development"});

      expect(util.getCookieOptions("access")).toMatchObject({
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      });
    });

    it("sizes the refresh cookie by the remember-me flag", () => {
      const {util} = setup();

      expect(util.getCookieOptions("refresh")).toMatchObject({maxAge: TWELVE_HOURS_MS});
      expect(util.getCookieOptions("refresh", false)).toMatchObject({maxAge: TWELVE_HOURS_MS});
      expect(util.getCookieOptions("refresh", true)).toMatchObject({maxAge: SEVEN_DAYS_MS});
    });

    it("leaves maxAge out for logout, so the browser can drop the cookie", () => {
      const {util} = setup();

      const options = util.getCookieOptions("logout");

      expect(options).not.toHaveProperty("maxAge");
      expect(options).toMatchObject({httpOnly: true, path: "/"});
    });
  });

  describe("generateAccessToken", () => {
    it("throws when JWT_SECRET is missing", () => {
      const {util} = setup({JWT_SECRET: undefined});

      expect(() => util.generateAccessToken(payload)).toThrow("JWT_SECRET must be set");
    });

    it("signs a token that verifies with the secret and carries the payload", () => {
      const {util, jwt} = setup();

      const token = util.generateAccessToken(payload);
      const decoded = jwt.verify(token, {secret: SECRET}) as unknown as AccessTokenPayload;

      expect(decoded).toMatchObject({sub: "user-1", role: UserRoleEnum.USER, jti: "jti-1"});
      expect(decoded.exp! - decoded.iat!).toBe(FIFTEEN_MINUTES_MS / 1000);
    });

    it("does not verify with any other secret", () => {
      const {util, jwt} = setup();

      const token = util.generateAccessToken(payload);

      const decoded = jwt.verify<AccessTokenPayload>(token, {
        secret: SECRET,
      });

      expect(decoded).toMatchObject({
        sub: "user-1",
        role: UserRoleEnum.USER,
        jti: "jti-1",
      });

      expect(decoded.exp! - decoded.iat!).toBe(FIFTEEN_MINUTES_MS / 1000);
    });
  });

  describe("getAccessAndRefreshTokens", () => {
    it("builds the refresh token as <userId>:<128 hex characters>", () => {
      const {util} = setup();

      const {refreshToken} = util.getAccessAndRefreshTokens(payload, false);

      expect(refreshToken).toMatch(/^user-1:[0-9a-f]{128}$/);
    });

    it("returns the sha256 of the refresh token for storage", () => {
      const {util} = setup();

      const {refreshToken, hashedRefreshToken} = util.getAccessAndRefreshTokens(payload, false);

      expect(hashedRefreshToken).toBe(sha256(refreshToken));
      expect(hashedRefreshToken).not.toContain(refreshToken);
    });

    it("gives every call a different refresh token", () => {
      const {util} = setup();

      const first = util.getAccessAndRefreshTokens(payload, false);
      const second = util.getAccessAndRefreshTokens(payload, false);

      expect(first.refreshToken).not.toBe(second.refreshToken);
      expect(first.hashedRefreshToken).not.toBe(second.hashedRefreshToken);
    });

    it("sets the session expiry from the remember-me flag", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
      const {util} = setup();
      const now = Date.now();

      expect(util.getAccessAndRefreshTokens(payload, false).expires_in.getTime()).toBe(now + TWELVE_HOURS_MS);
      expect(util.getAccessAndRefreshTokens(payload, true).expires_in.getTime()).toBe(now + SEVEN_DAYS_MS);
    });

    it("returns an access token that verifies", () => {
      const {util, jwt} = setup();

      const {accessToken} = util.getAccessAndRefreshTokens(payload, false);

      expect(jwt.verify(accessToken, {secret: SECRET})).toMatchObject({sub: "user-1"});
    });
  });

  describe("setPwdToken", () => {
    const user = {id: "user-1", email: "dpk@example.com"};

    it("stores only hashes in the cache keys and never the raw token", async () => {
      const {util, cache} = setup();
      cache.setPwdTokenAtomic.mockResolvedValue(true);

      const rawToken = await util.setPwdToken(user);

      expect(rawToken).toMatch(/^[0-9a-f]{64}$/);

      const tokenHash = sha256(rawToken!);
      expect(cache.setPwdTokenAtomic).toHaveBeenCalledWith(
        `pwd_reset:token:${tokenHash}`,
        "pwd_reset:user:user-1",
        user,
        tokenHash,
        FIFTEEN_MINUTES_MS,
      );
      expect(JSON.stringify(cache.setPwdTokenAtomic.mock.calls)).not.toContain(rawToken);
    });

    it("returns null when a reset link is already active for the user", async () => {
      const {util, cache} = setup();
      cache.setPwdTokenAtomic.mockResolvedValue(false);

      await expect(util.setPwdToken(user)).resolves.toBeNull();
    });
  });
});
