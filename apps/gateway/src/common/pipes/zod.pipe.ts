import z from "zod";
import {GraphQLError} from "graphql";
import type {ZodFieldError} from "@app/gateway/types";
import {Injectable, PipeTransform} from '@nestjs/common';

@Injectable()
export class ZodPipe<T extends z.ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new GraphQLError("Invalid Request.", {
        extensions: {
          errors: this.formatZodError(result.error),
          code: "BAD_REQUEST",
        }
      });
    }

    return result.data;
  }

  /** get structure format for zod errors */
  formatZodError(zodError: z.ZodError): ZodFieldError[] {
    return zodError?.issues?.map(i => ({
      field: i.path.join(", "),
      error: i.message,
    }));
  }
}
