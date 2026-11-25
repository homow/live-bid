import {z} from "zod";
import {UsernameSchema} from "../../common";
import {RegisterUserSchema} from "./register.schema";

export const LoginUserSchema = RegisterUserSchema
  .pick({
    password: true,
  })
  .extend({
    username: UsernameSchema.optional(),
    email: RegisterUserSchema.shape.email.optional(),
    remember: z.boolean().optional().default(false),
  })
  .refine(
    data => data.username || data.email,
    {
      path: ["username", "email"],
      message: "Either username or email is required",
    }
  );

export type LoginUserSchemaType = z.infer<typeof LoginUserSchema>;
