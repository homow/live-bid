import type {SafeUser} from "../../auth";
import type {CookieOptions} from "express";

export interface LoginResponseService {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  accessOptions: CookieOptions;
  refreshOptions: CookieOptions;
}
