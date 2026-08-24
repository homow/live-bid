import {SafeUser} from "../../auth";

export type RegisterResponse = Omit<SafeUser, 'username'>;
