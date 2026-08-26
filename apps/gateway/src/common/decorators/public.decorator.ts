import {SetMetadata} from "@nestjs/common";

export interface PublicDecoratorParams {
  makePublicRoleGuard: boolean;
  makePublicAccessGuard: boolean;
}

export const IS_PUBLIC_KEY = "IS_PUBLIC";

export const Public = (
  params: Partial<PublicDecoratorParams> = {
    makePublicAccessGuard: true,
    makePublicRoleGuard: true
  }
) => SetMetadata(IS_PUBLIC_KEY, params);
