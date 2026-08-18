import z, {output} from 'zod';
import {GraphQLError} from "graphql";
import {HttpStatus} from "@nestjs/common";
import type {ZodFieldError} from "@app/gateway/types";

export const defaultMessages: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.OK]: 'Request Successful',
  [HttpStatus.CREATED]: 'Resource Created',
  [HttpStatus.NO_CONTENT]: 'Resource Deleted',
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.TOO_MANY_REQUESTS]: "Too Many Requests",
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

/** get Default message with status code */
export function getDefaultMessage(status: HttpStatus): string {
  return defaultMessages[status] || 'Unknown';
}

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
