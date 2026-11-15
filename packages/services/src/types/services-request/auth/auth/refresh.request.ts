import type {RefreshGuardData} from "../../../auth";
import type {NormalizeClientInfoType} from "../../../gateway";

export interface RefreshRequestService extends RefreshGuardData{
  client_info: NormalizeClientInfoType;
}
