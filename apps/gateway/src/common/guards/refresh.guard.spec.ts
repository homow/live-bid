import {v4, v7} from "uuid";
import {createHash, randomBytes} from "node:crypto";
import {describe, expect, it} from "vitest";

import {RefreshGuard} from "./refresh.guard";
import {gatewayErrorOf, graphqlContext} from "../../../../../test/helpers/graphql";

/**
 * RefreshGuard checks that the refresh token has the right shape before the
 * auth service ever sees it. A valid token is built the same way TokenUtil builds it:
 * <user id>:<64 random bytes as hex>.
 */

class Resolver {
  refresh() {}
}

const guard = new RefreshGuard();

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const randomPart = () => randomBytes(64).toString("hex");
const validToken = (userId = v7()) => `${userId}:${randomPart()}`;

type FakeRequest = {
  cookies?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  refreshGuardData?: {userId: string; tokenHash: string};
};

const run = (req: FakeRequest) => guard.canActivate(graphqlContext(Resolver, "refresh", req as never));

describe("RefreshGuard", () => {
  describe("reading the token", () => {
    it("takes it from the refreshToken cookie", () => {
      const token = validToken();
      const req: FakeRequest = {cookies: {refreshToken: token}, headers: {}};

      expect(run(req)).toBe(true);
      expect(req.refreshGuardData?.tokenHash).toBe(sha256(token));
    });

    it("falls back to the x-refresh-token header", () => {
      const token = validToken();
      const req: FakeRequest = {cookies: {}, headers: {"x-refresh-token": token}};

      expect(run(req)).toBe(true);
      expect(req.refreshGuardData?.tokenHash).toBe(sha256(token));
    });

    it("uses the first value when the header comes as a list", () => {
      const first = validToken();
      const req: FakeRequest = {headers: {"x-refresh-token": [first, validToken()]}};

      expect(run(req)).toBe(true);
      expect(req.refreshGuardData?.tokenHash).toBe(sha256(first));
    });

    it("prefers the cookie when both are present", () => {
      const cookieToken = validToken();
      const req: FakeRequest = {cookies: {refreshToken: cookieToken}, headers: {"x-refresh-token": validToken()}};

      run(req);

      expect(req.refreshGuardData?.tokenHash).toBe(sha256(cookieToken));
    });

    it("works when cookie-parser isn't installed and req.cookies is undefined", () => {
      const req: FakeRequest = {cookies: undefined, headers: {"x-refresh-token": validToken()}};

      expect(run(req)).toBe(true);
    });
  });

});
