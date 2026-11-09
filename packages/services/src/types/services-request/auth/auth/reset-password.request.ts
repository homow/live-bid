import type {NormalizeClientInfoType} from "../../../gateway";

export interface ResetPasswordRequestService {
  token: string;
  email: string;
  newPassword: string;
  clientInfo: NormalizeClientInfoType;
}
