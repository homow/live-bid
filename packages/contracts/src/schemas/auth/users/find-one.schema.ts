import {z} from "zod";
import {LoginUserSchema} from "../auth";
import {UUIDv7Schema} from "../../common";

export const FindOneSchema = LoginUserSchema
  .pick({
    email: true,
    username: true,
  })
  .extend({
    user_id: UUIDv7Schema,
  })
  .partial()
  .refine(arg => (arg.email || arg.user_id || arg.username), {
    message: "At least one field (username or user_id or email) must be provided.",
    path: ['user_id'],
    params: ['username', 'display_name', 'email'],
  });

export type FindOneSchemaType = z.infer<typeof FindOneSchema>;
