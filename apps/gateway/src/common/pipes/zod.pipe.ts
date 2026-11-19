import z from "zod";
import {GraphQLError} from "graphql";
import type {ZodFieldError} from "@app/gateway/types";
import {Injectable, PipeTransform} from '@nestjs/common';

/**
 * **ZodPipe**
 *
 * NestJS validation pipe that validates incoming data against a Zod schema.
 * If validation fails, it throws a structured GraphQL error with field-level details.
 *
 * @remarks
 * - Designed primarily for **GraphQL** resolvers (`GraphQLError`).
 * - On failure, the error includes:
 *   - `extensions.code`: `"BAD_REQUEST"`
 *   - `extensions.statusCode`: `400`
 *   - `extensions.errors`: an array of `{ field, error }` objects.
 * - On success, returns the **parsed** (and potentially transformed) data.
 *
 * @example
 * @Args('input', new ZodPipe(RegisterUserSchema))
 * input: RegisterUserSchemaType
 *
 * Invalid input example:
 * ```JSON
 * {
 *   "message": "Invalid Request.",
 *   "extensions": {
 *     "code": "BAD_REQUEST",
 *     "statusCode": 400,
 *     "errors": [{ "field": "email", "error": "Invalid email" }]
 *   }
 * }
 * ```
 */
@Injectable()
export class ZodPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  /**
   * Validates the input value against the configured Zod schema.
   *
   * @param value - The raw input from the GraphQL argument.
   * @returns The validated and typed data.
   * @throws {GraphQLError} `400 BAD_REQUEST` if validation fails,
   *   including field-level errors in `extensions.errors`.
   */
  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new GraphQLError("Invalid Request.", {
        extensions: {
          errors: this.formatZodError(result.error),
          code: "BAD_REQUEST",
          statusCode: 400
        }
      });
    }

    return result.data;
  }

  /**
   * Converts a Zod error into a flat, field-level error list.
   *
   * @param zodError - The Zod error thrown by `safeParse`.
   * @returns An array of `{ field, error }` objects, where `field` is the
   *          dot-separated path of the invalid property.
   */
  formatZodError(zodError: z.ZodError): ZodFieldError[] {
    return zodError?.issues?.map(i => ({
      field: i.path.join(", "),
      error: i.message,
    }));
  }
}
