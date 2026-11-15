import type {RefreshToken} from "@live-bid/services/database";

export type RefreshTokenInsert = Pick<RefreshToken,
  | 'user_id'
  | 'token_hash'
  | 'expires_in'
  | 'client_info'
  | 'remember_me'
  | 'replace_by_token_id'>;
