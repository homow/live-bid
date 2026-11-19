import type {NormalizeClientInfoType} from "../../../gateway";

export interface ChangePasswordRequestService {
  userId: string;
  oldPassword: string;
  newPassword: string;
  clientInfo: NormalizeClientInfoType;
}
