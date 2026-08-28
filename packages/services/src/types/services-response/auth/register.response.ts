import {SafeUser} from "../../auth";

export type RegisterResponseService = Omit<SafeUser, 'username'>;
