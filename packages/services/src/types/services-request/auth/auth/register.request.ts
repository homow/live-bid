import type {NormalizeClientInfoType} from "../../../gateway";
import type {RegisterUserSchemaType} from "@live-bid/contracts/schemas";

export interface RegisterRequestService {
  input: RegisterUserSchemaType;
  clientInfo: NormalizeClientInfoType;
}
