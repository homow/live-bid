import {z} from "zod";
import {UserPasswordSchema, UsernameSchema} from "../common";

export const LoginUserSchema = z.object({
  username: UsernameSchema.optional(),
  email: z.email().optional(),
  password: UserPasswordSchema
}).refine(
  data => data.username || data.email,
  {
    message: "Either username or email is required",
    path: ["username", "email"],
  }
);

export type LoginUserSchemaType = z.infer<typeof LoginUserSchema>;
