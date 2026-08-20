import {z} from "zod";

export const UserDisplayNameSchema = z.string().min(3).max(60).trim();

export const RegisterUserSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Username must start with a letter and can only contain letters, numbers, and underscore"
    ),
  display_name: UserDisplayNameSchema,
  password: z.string()
    .trim()
    .min(8)
    .max(25)
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]+$/,
      {error: "password must contain at least one letter and one number"}
    ),
  email: z.email().nonempty().trim()
});

export type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>;
