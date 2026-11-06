import type {NormalizeClientInfoType} from "../../../gateway";

export interface ForgotPasswordRequestService {
  email: string;
  clientInfo: NormalizeClientInfoType;
}
