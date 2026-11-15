import type {UpdateProfileSchemaType} from "@live-bid/contracts/schemas";

export interface UpdateProfileRequestService {
  userId: string;
  updatableData: UpdateProfileSchemaType;
}
