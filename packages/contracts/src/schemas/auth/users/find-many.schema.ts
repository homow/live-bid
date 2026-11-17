import {z} from "zod";
import {UserRoleEnum} from "../../../enums";
import {PaginationSchema} from "../../common";

export const FindManyUserSchema = PaginationSchema.extend({
  role: z
    .enum(UserRoleEnum)
    .optional(),
});

export type FindManyUserSchemaType = z.infer<typeof FindManyUserSchema>;
