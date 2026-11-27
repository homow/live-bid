import {JwtService} from "@nestjs/jwt";
import {describe, expect, it} from "vitest";

import {AccessStrategy} from "./access.strategy";
import {ACCESS_TOKEN_NAME} from "@live-bid/services/names";

/**
 * These tests run real tokens through the real passport-jwt strategy,
 * so "which tokens get accepted" is checked end to end.
 */

const SECRET = "test-secret-that-is-long-enough-1234567890";

const jwt = new JwtService();
const sign = (payload: Record<string, unknown>, secret = SECRET) =>
  jwt.sign(payload, {secret, expiresIn: "15m"});

const config = (values: Record<string, string | undefined>) => ({get: (key: string) => values[key]});
const makeStrategy = (values: Record<string, string | undefined> = {JWT_SECRET: SECRET}) =>
  new AccessStrategy(config(values) as never);

type Outcome = { result: "success" | "fail" | "error"; user?: unknown };

/** Feeds a request to the strategy the way Passport would and reports what it decided */
function authenticate(strategy: AccessStrategy, req: Record<string, unknown>): Promise<Outcome> {
  return new Promise((resolve) => {
    const hooks = strategy as unknown as Record<string, (arg?: unknown) => void>;

    hooks.success = (user) => resolve({result: "success", user});
    hooks.fail = () => resolve({result: "fail"});
    hooks.error = () => resolve({result: "error"});

    (strategy as unknown as { authenticate: (req: unknown) => void }).authenticate(req);
  });
}

const base64Url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

describe("AccessStrategy", () => {
  const payload = {sub: "user-1", role: "ADMIN", jti: "jti-1"};

  describe("finding the token", () => {
    it("accepts a token from the access cookie", async () => {
      const token = sign(payload);

      const outcome = await authenticate(makeStrategy(), {headers: {}, cookies: {[ACCESS_TOKEN_NAME]: token}});

      expect(outcome.result).toBe("success");
    });

    it("accepts a bearer token from the Authorization header", async () => {
      const token = sign(payload);

      const outcome = await authenticate(makeStrategy(), {headers: {authorization: `Bearer ${token}`}});

      expect(outcome.result).toBe("success");
    });

    it("prefers the cookie when both are sent", async () => {
      const cookieToken = sign({...payload, sub: "from-cookie"});
      const headerToken = sign({...payload, sub: "from-header"});

      const outcome = await authenticate(makeStrategy(), {
        headers: {authorization: `Bearer ${headerToken}`},
        cookies: {[ACCESS_TOKEN_NAME]: cookieToken},
      });

      expect(outcome.user).toMatchObject({userId: "from-cookie"});
    });

    it("rejects a request without any token", async () => {
      const outcome = await authenticate(makeStrategy(), {headers: {}, cookies: {}});

      expect(outcome.result).toBe("fail");
    });
  });

  describe("telling good tokens from bad ones", () => {
    const attempt = (token: string) => authenticate(makeStrategy(), {headers: {authorization: `Bearer ${token}`}});

    it("rejects an expired token", async () => {
      const expired = jwt.sign({...payload, exp: Math.floor(Date.now() / 1000) - 60}, {secret: SECRET});

      expect((await attempt(expired)).result).toBe("fail");
    });

    it("rejects a token signed with a different secret", async () => {
      const forged = sign(payload, "some-other-secret-that-is-also-long-1234");

      expect((await attempt(forged)).result).toBe("fail");
    });

    it("rejects an unsigned token that claims alg none", async () => {
      const unsigned = `${base64Url({alg: "none", typ: "JWT"})}.${base64Url({sub: "attacker", role: "OWNER"})}.`;

      expect((await attempt(unsigned)).result).toBe("fail");
    });

    it("rejects a token whose payload was edited after signing", async () => {
      const [header, , signature] = sign(payload).split(".");
      const tampered = `${header}.${base64Url({...payload, role: "OWNER"})}.${signature}`;

      expect((await attempt(tampered)).result).toBe("fail");
    });
  });
});
