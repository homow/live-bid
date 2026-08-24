import type {User} from "../../database";

export type SafeUser = Omit<User, 'password'>;
