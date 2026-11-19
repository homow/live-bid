import geoip from "geoip-lite";
import {UAParser} from "ua-parser-js";
import {GraphQLContext} from "@app/gateway/types";
import {GqlExecutionContext} from "@nestjs/graphql";
import {normalizeClientInfo} from "@app/gateway/lib/utils";
import {createParamDecorator, ExecutionContext} from "@nestjs/common";

/**
 * **@NormalizeClientInfo() Parameter Decorator**
 *
 * Extracts and normalizes client metadata from the incoming GraphQL request
 * (IP, User-Agent, geolocation, and preferred language) into a single payload.
 *
 * @remarks
 * **IP resolution priority:**
 * 1. `x-forwarded-for` (for proxies/load balancers)
 * 2. `cf-connection-ip` (Cloudflare)
 * 3. `req.ip` (Express default)
 * 4. `req.socket.remoteAddress` (fallback)
 *
 * **Other metadata:**
 * - **User-Agent:** Parsed via `UAParser` into `{ browser, os, device }`.
 * - **Geolocation:** Resolved via `geoip-lite` from the IP (or `null` if not resolvable).
 * - **Language:** Read from the `accept-language` header.
 *
 * The raw (un-normalized) metadata is also attached to `req.clientInfo` for
 * downstream access (e.g., audit logging).
 *
 * @returns The normalized client info payload, typically used in
 *   security alerts and audit logs.
 *
 * @example
 * @Mutation(() => String)
 * login(
 *   @Args('input') input: LoginInput,
 *   @NormalizeClientInfo() clientInfo: NormalizeClientInfoType
 * ) {
 *   return this.authService.login(input, clientInfo);
 * }
 */
export const NormalizeClientInfo = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const req = gqlCtx.getContext<GraphQLContext>().req;

    const rawIp =
      req.headers["x-forwarded-for"] ||
      req.headers["cf-connection-ip"] ||
      req.ip ||
      req.socket.remoteAddress ||
      null;

    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

    const userAgent: string = req.headers["user-agent"] ?? "";
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    const geo = typeof ip === "string" ? geoip.lookup(ip) : null;

    const clientInfo = {
      ip,
      ua,
      geo,
      lang: req.headers["accept-language"] ?? null,
    };

    req.clientInfo = clientInfo;

    return normalizeClientInfo(clientInfo);
  }
);
