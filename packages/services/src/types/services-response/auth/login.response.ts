import type {SafeUser} from "../../auth";
import type {CookieOptions} from "express";

export interface LoginResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  accessOptions: CookieOptions;
  refreshOptions: CookieOptions;
}
