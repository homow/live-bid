import type {SafeUser} from "../../../auth";

export type PublicProfileResponseService = Omit<SafeUser,
  | 'id'
  | 'role'
  | 'email'
  | 'created_at'
  | 'updated_at'
>;
