import type {UserRoleEnum} from "@live-bid/contracts/enums";

interface ModifyRoleUserData {
  id: string;
  newRole: UserRoleEnum;
}

export interface ModifyRoleRequestService {
  actor: ModifyRoleUserData;
  target: ModifyRoleUserData;
}
