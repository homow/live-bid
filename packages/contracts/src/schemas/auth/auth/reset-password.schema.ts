import z from "zod";

export const PasswordResetTokenSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[0-9a-f]{64}$/i,
    "Invalid password reset token format"
  )
  .brand<"PasswordResetToken">();
