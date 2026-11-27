import z from "zod";
import {GraphQLError} from "graphql";
import {describe, expect, it} from "vitest";

import {ZodPipe} from "./zod.pipe";

/**
 * ZodPipe sits in front of every GraphQL input, so the shape of its error
 * is part of the API the frontend relies on.
 */

const schema = z.object({
  email: z.email(),
  display_name: z.string().min(2),
  remember: z.boolean().optional().default(false),
});

const pipe = new ZodPipe(schema);

/** Runs the pipe and returns the GraphQLError it threw */
function failureOf(value: unknown): GraphQLError {
  try {
    pipe.transform(value);
  } catch (error) {
    expect(error).toBeInstanceOf(GraphQLError);
    return error as GraphQLError;
  }

  throw new Error("Expected the pipe to throw, but it accepted the value");
}

describe("ZodPipe", () => {

});
