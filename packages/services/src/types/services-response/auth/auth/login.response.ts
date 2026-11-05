import type {CookieOptions} from "express";
import type {SafeUser} from "../../../auth";

export interface LoginResponseService {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  accessOptions: CookieOptions;
  refreshOptions: CookieOptions;
}
