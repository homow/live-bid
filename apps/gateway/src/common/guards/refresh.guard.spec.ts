import {v4, v7} from "uuid";
import {describe, expect, it} from "vitest";
import {RefreshGuard} from "./refresh.guard";
import {createHash, randomBytes} from "node:crypto";
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
  refreshGuardData?: { userId: string; tokenHash: string };
};

const run = (req: FakeRequest) => guard.canActivate(graphqlContext(Resolver, "refresh", req));

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

  describe("what it hands on", () => {
    it("sets the user id from the token and the sha256 of the whole raw token", () => {
      const userId = v7();
      const token = validToken(userId);
      const req: FakeRequest = {cookies: {refreshToken: token}, headers: {}};

      run(req);

      expect(req.refreshGuardData).toEqual({userId, tokenHash: sha256(token)});
    });
  });

  describe("rejecting bad tokens", () => {
    const expectRejected = (req: FakeRequest) => {
      const error = gatewayErrorOf(() => run(req));

      expect(error).toMatchObject({statusCode: 401, code: "REFRESH_TOKEN_EXPIRE"});
      expect(req.refreshGuardData).toBeUndefined();
    };

    it("rejects a request without any token", () => {
      expectRejected({cookies: {}, headers: {}});
    });

    it.each([
      ["a token with no colon", "justonepart"],
      ["a user id that isn't a uuid", `not-a-uuid:${randomPart()}`],
      ["a uuid of the wrong version (v4)", `${v4()}:${randomPart()}`],
      ["a random part that is too short", `${v7()}:abc123`],
      ["a random part that isn't hex", `${v7()}:${"z".repeat(128)}`],
      ["an empty random part", `${v7()}:`],
    ])("rejects %s", (_label, token) => {
      expectRejected({cookies: {refreshToken: token}, headers: {}});
    });
  });

});
