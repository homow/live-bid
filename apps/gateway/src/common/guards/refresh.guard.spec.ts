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

});
