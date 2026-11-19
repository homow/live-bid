import type {NormalizeClientInfoType} from "../../../gateway";

export interface ResetPasswordRequestService {
  token: string;
  newPassword: string;
  clientInfo: NormalizeClientInfoType;
}
