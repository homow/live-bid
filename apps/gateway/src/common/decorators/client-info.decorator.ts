import {GraphQLContext} from "@app/gateway/types";
import {GqlExecutionContext} from "@nestjs/graphql";
import {normalizeClientInfo} from "@app/gateway/lib";
import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {UAParser} from "ua-parser-js";
import geoip from "geoip-lite";

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
