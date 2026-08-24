import {UserRoleEnum} from "@live-bid/contracts/enums";

/** **AccessToken payload on JWT** */
export interface AccessTokenPayload {
  sub: string;
  exp?: number;
  iat?: number;
  jti?: string;
  role: UserRoleEnum;
  display_name?: string;
}
