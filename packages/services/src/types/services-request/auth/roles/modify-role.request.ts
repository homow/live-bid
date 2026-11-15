import type {UserRoleEnum} from "@live-bid/contracts/enums";

interface ModifyRoleUserData {
  id: string;
  role: UserRoleEnum;
}

export interface ModifyRoleRequestService {
  action: 'assign' | 'remove';
  actionUserData: ModifyRoleUserData;
  targetUserData: ModifyRoleUserData;
}
