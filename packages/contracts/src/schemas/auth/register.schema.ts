import {z} from "zod";

export const UserDisplayNameSchema = z.string().min(3).max(60).trim();

export const RegisterSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscore (_)"
    )
    .regex(
      /^[a-zA-Z]/,
      "Username must start with a letter"
    )
    .regex(
      /^[a-zA-Z0-9_]*$/,
      "Username can only contain letters, numbers, and underscore"
    ),
  displayName: UserDisplayNameSchema,
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

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
