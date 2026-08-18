import z, {output} from 'zod';
import {GraphQLError} from "graphql";
import type {ZodFieldError} from "@app/gateway/types";

/** get structure format for zod errors */
export function formatZodError(zodError: z.ZodError): ZodFieldError[] {
  return zodError?.issues?.map(i => ({
    field: i.path.join(", "),
    error: i.message,
  }));
}

/** safe zod body */
export function checkZod<T extends z.ZodTypeAny>(schema: T, value: unknown): output<T> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new GraphQLError("Invalid Request.", {
      extensions: {
        errors: formatZodError(result.error),
        code: "BAD_REQUEST",
      }
    });
  }

  return result.data;
}
