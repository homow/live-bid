import type {Request} from "express";
import type {SafeUser} from "../user";
import type {RefreshToken} from "../../../database";
import type {UserRoleEnum} from "@live-bid/contracts/enums";

/** **AccessToken payload on JWT** */
export interface AccessTokenPayload {
  sub: string;
  exp?: number;
  iat?: number;
  jti?: string;
  role: UserRoleEnum;
}

/** **Refresh Token Payload** */
export interface RefreshTokenPayload {
  refreshRecord: Omit<RefreshToken, 'client_info'>;
  user: SafeUser;
}

/**
 * **Refresh Guard Data**
 * */
export interface RefreshGuardData {
  userId: string;
  tokenHash: string;
}

/**
 * **Refresh Request**
 * */
export interface RefreshRequest extends Request {
  refreshGuardData: RefreshGuardData;
}
