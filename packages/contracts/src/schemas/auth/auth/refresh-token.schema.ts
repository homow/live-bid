import {z} from "zod";

export const refreshTokenRandomPartSchema = z
  .string({
    error: "Token must be a string",
  })
  .length(128, {
    error: "Token must be exactly 128 characters long",
  })
  .regex(/^[0-9a-fA-F]+$/, {
    error: "Token must contain only hexadecimal characters (0-9, a-f)",
  });
