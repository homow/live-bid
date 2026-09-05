import * as ZodSchemas from "@live-bid/contracts/schemas";
import type {NormalizeClientInfoType} from "../../gateway";

export interface LoginRequestService {
  clientInfo: NormalizeClientInfoType;
  userData: ZodSchemas.LoginUserSchemaType;
}
