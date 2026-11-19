import type {User} from "../../../database";
import type {AccessTokenPayload} from "../auth";

export type SafeUser = Omit<User, 'password'>;

export type UserAccess = Omit<AccessTokenPayload, 'sub'> & {
  userId: string;
};
