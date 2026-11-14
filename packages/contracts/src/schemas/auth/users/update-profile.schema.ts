import z from "zod";
import {UsernameSchema, UserDisplayNameSchema} from "../../common";

export const UpdateProfileSchema = z
  .object({
    username: UsernameSchema.nullable(),
    display_name: UserDisplayNameSchema,
  })
  .partial()
  .refine(
    data => (
      data.display_name
      || data.display_name === undefined
      || data.username !== undefined
    ),
    {
      message: "At least one field (username or display_name) must be provided.",
      path: ['username'],
      params: ['username', 'display_name'],
    }
  );

export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;
