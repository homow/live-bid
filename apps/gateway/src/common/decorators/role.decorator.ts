import {SetMetadata} from "@nestjs/common";
import {IsRoleAccessParam} from "@live-bid/services/lib";

export type RoleDecoratorParams = Pick<IsRoleAccessParam, 'requiredRole' | 'strict'>;

export const ROLE_METADATA = "ROLE_METADATA";

export const Role = (
  params: RoleDecoratorParams
) => SetMetadata(ROLE_METADATA, params);
