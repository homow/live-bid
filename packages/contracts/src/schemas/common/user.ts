import z from "zod";

export const UserDisplayNameSchema = z
  .string()
  .min(3, "Display name must be at least 3 characters")
  .max(60, "Display name must be at most 60 characters")
  .trim();

export const UserPasswordSchema = z
  .string()
  .trim()
  .min(8)
  .max(30)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]+$/,
    {error: "password must contain at least one letter and one number"}
  );

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(255, "Username must be at most 255 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Username must start with a letter and can only contain letters, numbers, and underscore"
  );
