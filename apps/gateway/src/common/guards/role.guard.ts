import {Reflector} from "@nestjs/core";
import {getRequestResponse} from "@app/gateway/lib";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {AppException, isRoleAccess} from "@live-bid/services/lib";
import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {IS_PUBLIC_KEY, PublicDecoratorParams, ROLE_METADATA, RoleDecoratorParams} from "@app/gateway/common";
import {AccessRequest} from "@live-bid/services/types";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<PublicDecoratorParams>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || {
      makePublicRoleGuard: false,
      makePublicAccessGuard: false,
    };

    console.log("\n\n====================================\n\n");
    console.log(isPublic);
    console.log("\n\n====================================\n\n");

    if (isPublic.makePublicRoleGuard) return true;

    const {requiredRole, strict} = this.reflector.getAllAndOverride<RoleDecoratorParams>(ROLE_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]) || {
      strict: true,
      requiredRole: UserRoleEnum.USER,
    };

    const {req} = getRequestResponse<AccessRequest>(context);

    console.log(req);

    const userRole = req.user.role;

    const isAllowed: boolean = isRoleAccess({
      strict,
      userRole,
      requiredRole,
    });

    if (!isAllowed) {
      const strictMessage = strict
        ? " (strict mode: exact role match required)"
        : " (hierarchical mode: role must be equal or higher)";

      throw new AppException({
        statusCode: 403,
        code: "ROLE_NOT_ALLOWED",
        message: `Access denied. Your role (${userRole}) does not meet the required role (${requiredRole})${strictMessage}.`,
      });
    }

    return true;
  }
}
