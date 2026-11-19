import {refreshToken} from "@live-bid/services/database";

export const REFRESH_TOKEN_PUBLIC_COLUMNS = {
  id: refreshToken.id,
  user_id: refreshToken.user_id,
  token_hash: refreshToken.token_hash,
  is_revoked: refreshToken.is_revoked,
  expires_in: refreshToken.expires_in,
  created_at: refreshToken.created_at,
  updated_at: refreshToken.updated_at,
  remember_me: refreshToken.remember_me,
  replace_by_token_id: refreshToken.replace_by_token_id,
};
