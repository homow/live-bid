import type {NormalizeClientInfoType} from "../../../gateway";

export interface ResetPasswordRequestService {
  email: string;
  token: string;
  clientInfo: NormalizeClientInfoType;
}
