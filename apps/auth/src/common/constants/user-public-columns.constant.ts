import {user} from "@live-bid/services/database";

export const USER_PUBLIC_COLUMNS = {
  id: user.id,
  role: user.role,
  email: user.email,
  username: user.username,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
  display_name: user.display_name,
};
