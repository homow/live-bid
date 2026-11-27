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
  it("returns the parsed value, defaults included", () => {
    expect(pipe.transform({email: "dpk@example.com", display_name: "dpk"})).toEqual({
      email: "dpk@example.com",
      display_name: "dpk",
      remember: false,
    });
  });

  it("drops fields the schema doesn't know, so extras never reach the services", () => {
    const parsed = pipe.transform({email: "dpk@example.com", display_name: "dpk", role: "OWNER"});

    expect(parsed).not.toHaveProperty("role");
  });

  it("throws a 400 BAD_REQUEST GraphQLError for invalid input", () => {
    const error = failureOf({email: "not-an-email", display_name: "dpk"});

    expect(error.message).toBe("Invalid Request.");
    expect(error.extensions).toMatchObject({code: "BAD_REQUEST", statusCode: 400});
  });

  it("lists the invalid fields with a message each", () => {
    const error = failureOf({email: "not-an-email", display_name: "d"});

    const errors = error.extensions.errors as Array<{field: string; error: string}>;

    expect(errors.map((e) => e.field).sort()).toEqual(["display_name", "email"]);
    for (const entry of errors) {
      expect(entry.error).toEqual(expect.any(String));
      expect(entry.error.length).toBeGreaterThan(0);
    }
  });

  it("reports a missing field under its name", () => {
    const error = failureOf({display_name: "dpk"});

    const errors = error.extensions.errors as Array<{field: string}>;
    expect(errors.map((e) => e.field)).toEqual(["email"]);
  });

  it("rejects input that isn't an object at all", () => {
    expect(failureOf(null).extensions).toMatchObject({code: "BAD_REQUEST", statusCode: 400});
    expect(failureOf("hello").extensions).toMatchObject({code: "BAD_REQUEST", statusCode: 400});
  });
});
