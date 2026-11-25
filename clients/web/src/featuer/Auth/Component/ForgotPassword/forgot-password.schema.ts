import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters"),
});

export type ForgotPasswordSchemaType = z.infer<
  typeof ForgotPasswordSchema
>;