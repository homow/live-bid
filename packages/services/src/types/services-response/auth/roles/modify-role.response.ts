import {UserRoleEnum} from "@live-bid/contracts/enums";

export interface ModifyRoleResponseService {
  userId: string;
  result: string;
  newRole: UserRoleEnum;
}
