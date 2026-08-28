import type {RefreshTokenPayload} from "../../auth";
import type {NormalizeClientInfoType} from "../../gateway";

export interface RefreshRequestService {
  refreshPayload: RefreshTokenPayload;
  client_info: NormalizeClientInfoType;
}
