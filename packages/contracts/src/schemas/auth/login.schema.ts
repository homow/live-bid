import {z} from "zod";
import {UserPasswordSchema, UsernameSchema} from "../common";

export const LoginUserSchema = z.object({
  username: UsernameSchema.optional(),
  email: z.email().optional(),
  password: UserPasswordSchema,
  remember: z.boolean().optional().default(false),
}).refine(
  data => data.username || data.email,
  {
    message: "Either username or email is required",
    path: ["username", "email"],
  }
);

export type LoginUserSchemaType = z.infer<typeof LoginUserSchema>;
