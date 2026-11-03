import {z} from "zod";
import {UserPasswordSchema} from "../common";

export const ChangePasswordSchema = z.object({
  oldPassword: UserPasswordSchema,
  newPassword: UserPasswordSchema,
});

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
