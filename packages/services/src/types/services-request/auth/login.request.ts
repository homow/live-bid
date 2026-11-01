import type {NormalizeClientInfoType} from "../../gateway";
import type {LoginUserSchemaType} from "@live-bid/contracts/schemas";

export interface LoginRequestService {
  clientInfo: NormalizeClientInfoType;
  userData: LoginUserSchemaType;
}
