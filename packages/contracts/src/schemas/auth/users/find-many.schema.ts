import {z} from "zod";
import {UserRoleEnum} from "../../../enums";
import {paginationOffsetSchema, PaginationSchema} from "../../common";

export const FindManyUsersSchema = paginationOffsetSchema(PaginationSchema.extend({
  role: z
    .enum(UserRoleEnum)
    .optional(),

  is_active: z
    .boolean()
    .optional()
}));

export type FindManyUsersSchemaType = z.infer<typeof FindManyUsersSchema>;
