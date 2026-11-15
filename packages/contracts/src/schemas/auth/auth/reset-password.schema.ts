import z from "zod";
import {UserPasswordSchema} from "../../common";

/**
 * Schema for validating a raw password reset token.
 * The token is a 32-byte random value encoded as a 64-character hex string.
 */
export const PasswordResetTokenSchema = z
  .string()
  .trim()
  .length(64, "Password reset token must be exactly 64 characters")
  .regex(/^[0-9a-f]+$/i, "Password reset token must be a valid hex string");

export const ResetPasswordSchema = z.object({
  token: PasswordResetTokenSchema,
  newPassword: UserPasswordSchema,
});

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
