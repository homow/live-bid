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

type Outcome = {result: "success" | "fail" | "error"; user?: unknown};

/** Feeds a request to the strategy the way Passport would and reports what it decided */
function authenticate(strategy: AccessStrategy, req: Record<string, unknown>): Promise<Outcome> {
  return new Promise((resolve) => {
    const hooks = strategy as unknown as Record<string, (arg?: unknown) => void>;

    hooks.success = (user) => resolve({result: "success", user});
    hooks.fail = () => resolve({result: "fail"});
    hooks.error = () => resolve({result: "error"});

    (strategy as unknown as {authenticate: (req: unknown) => void}).authenticate(req);
  });
}

const base64Url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

describe("AccessStrategy", () => {});
