import z from "zod";
import {UserPasswordSchema} from "../../common";

export const PasswordResetTokenSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[0-9a-f]{64}$/i,
    "Invalid password reset token format"
  )
  .brand<"PasswordResetToken">();

export const ResetPasswordSchema = z.object({
  token: PasswordResetTokenSchema,
  newPassword: UserPasswordSchema,
});

export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
