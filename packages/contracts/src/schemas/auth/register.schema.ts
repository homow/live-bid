import {z} from "zod";
import {UserPasswordSchema, UserDisplayNameSchema} from "../common";

export const RegisterUserSchema = z.object({
  display_name: UserDisplayNameSchema,
  password: UserPasswordSchema,
  email: z.email().nonempty().trim()
});

export type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>;
