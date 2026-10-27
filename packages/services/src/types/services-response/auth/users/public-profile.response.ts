import type {SafeUser} from "../../../auth";

export type PublicProfileResponseService = Pick<SafeUser,
  | 'role'
  | 'username'
  | 'is_active'
  | 'display_name'
>;
