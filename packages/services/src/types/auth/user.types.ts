import type {User} from "../../database";
import type {AccessTokenPayload} from "./token.types";

export type SafeUser = Omit<User, 'password'>;

export type UserAccess = Omit<AccessTokenPayload, 'sub'> & {
  userId: string;
};
