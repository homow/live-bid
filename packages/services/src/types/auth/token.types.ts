import type {SafeUser} from "./user.types";
import type {RefreshToken} from "../../database";
import type {UserRoleEnum} from "@live-bid/contracts/enums";

/** **AccessToken payload on JWT** */
export interface AccessTokenPayload {
  sub: string;
  exp?: number;
  iat?: number;
  jti?: string;
  role: UserRoleEnum;
  display_name?: string;
}

/** **Refresh Token Payload** */
export interface RefreshTokenPayload {
  refreshRecord: Omit<RefreshToken, 'client_info'>;
  user: SafeUser;
}
