import {Reflector} from "@nestjs/core";
import {AuthGuard} from "@nestjs/passport";
import {ACCESS_STRATEGY_NAME} from "../strategies";
import {getRequestResponse} from "@app/gateway/lib";
import {GatewayException} from "@app/gateway/common";
import type {UserAccess} from "@live-bid/services/types";
import {IS_PUBLIC_KEY, PublicDecoratorParams} from "../decorators";
import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class AccessTokenGuard extends AuthGuard(ACCESS_STRATEGY_NAME) implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // noinspection JSUnusedGlobalSymbols
  getRequest(context: ExecutionContext) {
    const ctx = getRequestResponse(context);
    return ctx.req;
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<PublicDecoratorParams>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || {
      makePublicAccessGuard: false,
      makePublicPermissionGuard: false,
    };

    if (isPublic.makePublicAccessGuard) return true;

    return super.canActivate(context);
  }

  // noinspection JSUnusedGlobalSymbols
  handleRequest<T = UserAccess>(err: Error, user: T, _info: unknown, _context: ExecutionContext, _status?: unknown) {
    if (err || !user) throw new GatewayException({
      statusCode: 401,
      code: "ACCESS_TOKEN_EXPIRED",
      message: "Access token missing or expired",
    });
    return user;
  }
}
