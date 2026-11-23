import {vi} from "vitest";
import {TokenUtil} from "./token.util";
import {JwtService} from "@nestjs/jwt";

/**
 * Unit tests for TokenUtil.
 *
 * JwtService is the real one, so we can verify the tokens it signs.
 * Config and cache are small fakes.
 */
const SECRET = "test-secret-that-is-long-enough-for-hs256";

function setup(env: Record<string, string | undefined> = {}) {
  const values: Record<string, string | undefined> = {JWT_SECRET: SECRET, ...env};

  const config = {get: vi.fn((key: string) => values[key])};
  const cache = {setPwdTokenAtomic: vi.fn(), getDel: vi.fn()};
  const jwt = new JwtService();

  const util = new TokenUtil(config as never, jwt, cache as never);

  return {util, jwt, cache};
}
