import type {NormalizeClientInfoType} from "../../../gateway";

export interface ChangePasswordRequestService {
  userId: string;
  oldPassword: string;
  newPassword: string;
  refreshTokenId: string;
  clientInfo: NormalizeClientInfoType;
}
