import * as ZodSchemas from "@live-bid/contracts/schemas";
import type {NormalizeClientInfoType} from "../../gateway";

export interface LoginRequest {
  clientInfo: NormalizeClientInfoType;
  userData: ZodSchemas.LoginUserSchemaType;
}
