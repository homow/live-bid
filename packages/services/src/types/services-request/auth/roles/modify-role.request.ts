import type {UserRoleEnum} from "@live-bid/contracts/enums";

interface ModifyTargetRoleParams {
  id: string;
  newRole: UserRoleEnum;
}

interface ModifyActorRoleParams {
  id: string;
  role: UserRoleEnum;
}

export interface ModifyRoleRequestService {
  actor: ModifyActorRoleParams;
  target: ModifyTargetRoleParams;
}
