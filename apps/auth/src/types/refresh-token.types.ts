import type {RefreshToken} from "@live-bid/services/database";

export type RefreshTokenInsert = Pick<RefreshToken, 'token_hash' | 'replace_by_token_id' | 'user_id' | 'expires_in' | 'client_info' | 'remember_me'>;
