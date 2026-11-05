import {z} from "zod";
import {UserPasswordSchema} from "../../common";

export const ChangePasswordSchema = z.object({
  oldPassword: UserPasswordSchema,
  newPassword: UserPasswordSchema,
}).refine(
  (data) => data.newPassword !== data.oldPassword,
  {
    path: ["newPassword"],
    error: "New password must be different from old password",
  }
);

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
