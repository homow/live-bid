import {z} from "zod";
import {UserRoleEnum} from "../../../enums";
import {getPaginationWithOffsetSchema, PaginationSchema} from "../../common";

export const FindManyUsersSchema = getPaginationWithOffsetSchema(PaginationSchema.extend({
  role: z
    .enum(UserRoleEnum)
    .optional(),

  is_active: z
    .boolean()
    .optional()
}));

export type FindManyUsersSchemaType = z.infer<typeof FindManyUsersSchema>;
