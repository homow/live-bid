import {z} from "zod";
import {RegisterUserSchema} from "../auth";
import {UsernameSchema, UUIDv7Schema} from "../../common";

export const FindOneUserSchema = RegisterUserSchema
  .pick({
    email: true,
  })
  .extend({
    user_id: UUIDv7Schema,
    username: UsernameSchema,
  })
  .partial()
  .refine(arg => (arg.email || arg.user_id || arg.username), {
    message: "At least one field (username or user_id or email) must be provided.",
    path: ['user_id'],
    params: ['username', 'display_name', 'email'],
  });

export type FindOneUserSchemaType = z.infer<typeof FindOneUserSchema>;
