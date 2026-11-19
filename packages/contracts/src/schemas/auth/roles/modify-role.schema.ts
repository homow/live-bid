import z from "zod";
import {UUIDv7Schema} from "../../common";
import {UserRoleEnum} from "../../../enums";

export const ModifyRoleSchema = z.object({
  userId: UUIDv7Schema,
  newRole: z.enum(UserRoleEnum),
});

export type ModifyRoleSchemaType = z.infer<typeof ModifyRoleSchema>;
