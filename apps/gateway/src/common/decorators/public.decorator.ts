import {SetMetadata} from "@nestjs/common";

export interface PublicDecoratorParams {
  makePublicRoleGuard?: boolean;
  makePublicAccessGuard?: boolean;
}

export const IS_PUBLIC_KEY = "IS_PUBLIC";

export function Public(params: PublicDecoratorParams = {
  makePublicAccessGuard: true,
  makePublicRoleGuard: true
}) {
  return SetMetadata(IS_PUBLIC_KEY, params);
}
