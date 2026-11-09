import {AppException} from "./app.exceptions";
import type {TablesName} from "../../database";

/**
 * Minimal shape of a PostgreSQL error (as exposed by `pg` / Drizzle).
 */
interface PgErrorLike {
  code?: string;
  constraint?: string;
  table?: string;
  detail?: string;
  column?: string;
}

/**
 * Configuration for handling Drizzle ORM database errors.
 * Maps PostgreSQL error codes to user-friendly GraphQL exceptions.
 */
export interface HandleDrizzleErrorParams {
  /** The original error object caught from the database operation */
  e: unknown;

  /** Name of the primary resource/table being operated on (e.g., 'user', 'product') */
  mainResource: TablesName;

  /** Field name that caused a uniqueness conflict (for PostgreSQL code 23505) */
  conflictField: string;

  /** Field name that wasn't found during the operation (for PostgreSQL code 23503) */
  notFoundField?: string;

  /** Name of the resource that wasn't found (for PostgreSQL code 23503) */
  notFoundResource?: TablesName;

  /** Name of the resource that has dependencies preventing deletion */
  restrictResource?: TablesName;

  /** Foreign key column name that restricts the operation */
  restrictForeignKey?: string;
}

/**
 * Extracts PostgreSQL error information from a caught error object.
 * Drizzle may wrap the original PG error under `cause`, so we check both.
 *
 * @param e - The error to extract from
 * @returns Extracted PostgreSQL error or `null` if not a PG error
 */
function extractPgError(e: unknown): PgErrorLike | null {
  if (!(e instanceof Error)) return null;

  // Drizzle wraps PG errors under `cause`
  const cause = (e as { cause?: unknown }).cause;

  if (cause && typeof cause === "object" && "code" in cause) {
    return cause as PgErrorLike;
  }

  // Direct PG error (already at the top level)
  if ("code" in e) {
    return e as unknown as PgErrorLike;
  }

  return null;
}

/**
 * Maps PostgreSQL error codes to GraphQL errors with user-friendly messages.
 *
 * Supported codes:
 * - `23505` — Unique violation (duplicate key)
 * - `23503` — Foreign key violation
 * - `23502` — Not-null violation
 * - `23514` — Check constraint violation
 *
 * @param data - Error handling parameters
 * @throws {AppException} Always throws a mapped `AppException` (or re-throws unknown errors)
 */
export function handleDrizzleError(data: HandleDrizzleErrorParams): never {
  const {
    e,
    mainResource,
    notFoundField,
    conflictField,
    restrictResource,
    notFoundResource,
    restrictForeignKey,
  } = data;

  const pgError = extractPgError(e);

  if (pgError?.code) {
    switch (pgError.code) {

      // 23505: Unique violation (duplicate key)
      case "23505": {
        throw new AppException({
          code: "CONFLICT",
          message: `${mainResource} already exists in database. Please change the ${conflictField} and try again`,
          statusCode: 409,
        });
      }

      //23503: Foreign key violation - With `restrictForeignKey` + `restrictResource`: deletion is blocked by dependencies - Otherwise: referenced record does not exist
      case "23503": {
        if (restrictForeignKey && restrictResource) {
          throw new AppException({
            code: "BAD_REQUEST",
            message: `Cannot delete ${mainResource} because it has related ${restrictResource} records. Please remove the ${restrictForeignKey} association first`,
            statusCode: 400,
          });
        }
      }

        throw new AppException({
          code: "NOT_FOUND",
          message: `${notFoundResource || mainResource} not found or has related records. Please check your ${notFoundField || "id"} and try again`,
          statusCode: 404,
        });

      // 23502: Not-null violation
      case "23502": {
        throw new AppException({
          code: "BAD_REQUEST",
          message: `Missing required field on ${mainResource}${
            pgError.column ? `: ${pgError.column}` : ""
          }. The field ${pgError.column || "unknown"} cannot be empty`,
          statusCode: 400,
        });
      }

      // 23514: Check constraint violation
      case "23514": {
        throw new AppException({
          code: "BAD_REQUEST",
          message: `Invalid value provided for ${mainResource}. The value violates the allowed constraints for ${mainResource}`,
          statusCode: 400,
        });
      }
    }
  }

  // Unknown error: re-throw as-is
  throw e;
}

/**
 * Throws a GraphQL error for a resource that was not found.
 *
 * @param resource - The name of the resource that wasn't found
 * @param fields - The field(s) that were searched by (e.g., `id`, `email`)
 * @throws {AppException} Always throws a NOT_FOUND GraphQL error
 */
export function throwNotFound(resource: string, fields: string): never {
  throw new AppException({
    code: "NOT_FOUND",
    message: `${resource} not found in database. Please check your ${fields} and try again`,
    statusCode: 404,
  });
}
