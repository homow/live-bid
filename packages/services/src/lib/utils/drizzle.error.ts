import {GraphQLError} from "graphql";
import type {TablesName} from "../../database";

/**
 * Interface representing a PostgreSQL error structure
 * @interface PgErrorLike
 * @property {string} [code] - PostgreSQL error code (e.g., '23505' for unique violation)
 * @property {string} [constraint] - Name of the violated constraint
 * @property {string} [table] - Name of the affected table
 * @property {string} [detail] - Detailed error message from PostgreSQL
 * @property {string} [column] - Name of the affected column
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
export interface CheckDrizzleErrorParams {
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
 * Extracts PostgreSQL error information from a caught error object
 * @param {unknown} e - The error to extract from
 * @returns {PgErrorLike | null} Extracted PostgreSQL error or null if not a PG error
 */
function extractPgError(e: unknown): PgErrorLike | null {
  if (!(e instanceof Error)) return null;

  // Check for nested cause (common in Drizzle ORM)
  const cause = (e as { cause?: unknown }).cause;

  if (cause && typeof cause === "object" && "code" in cause) {
    return cause as PgErrorLike;
  }

  // Direct error with code property
  if ("code" in e) {
    return e as unknown as PgErrorLike;
  }

  return null;
}

/**
 * Maps PostgreSQL error codes to GraphQL errors with user-friendly messages
 * @param {CheckDrizzleErrorParams} data - Error handling parameters
 * @throws {GraphQLError} Always throws a GraphQL error with appropriate extension
 */
export function checkDrizzleError(data: CheckDrizzleErrorParams): never {
  const {
    restrictForeignKey,
    restrictResource,
    conflictField,
    notFoundField,
    notFoundResource,
    mainResource,
    e,
  } = data;

  const pgError = extractPgError(e);

  if (pgError?.code) {
    switch (pgError.code) {
      /**
       * 23505: Unique violation (duplicate key)
       * Thrown when attempting to insert a duplicate value in a unique column
       */
      case "23505": {
        throw new GraphQLError(`${mainResource} already exists in database`, {
          extensions: {
            code: "CONFLICT",
            status: 409,
            field: conflictField,
            message: `Please change the ${conflictField} and try again`,
          },
        });
      }

      /**
       * 23503: Foreign key violation
       * Thrown when attempting to delete/modify a record that has dependencies
       * or when referencing a non-existent record
       */
      case "23503": {
        // Case: Attempting to delete a resource that has existing relations
        if (restrictForeignKey && restrictResource) {
          throw new GraphQLError(
            `Cannot delete ${mainResource} because it has related ${restrictResource} records`,
            {
              extensions: {
                code: "BAD_REQUEST",
                status: 400,
                foreignKey: restrictForeignKey,
                message: `Please remove the ${restrictForeignKey} association first`,
              },
            }
          );
        }

        // Case: Referenced resource does not exist
        throw new GraphQLError(
          `${notFoundResource || mainResource} not found or has related records`,
          {
            extensions: {
              code: "NOT_FOUND",
              status: 404,
              field: notFoundField || "id",
              message: `Please check your ${notFoundField || "id"} and try again`,
            },
          }
        );
      }

      // 23502: Not-null violation
      // Thrown when attempting to insert a null value into a NOT NULL column
      case "23502": {
        throw new GraphQLError(
          `Missing required field on ${mainResource}${pgError.column ? `: ${pgError.column}` : ""}`,
          {
            extensions: {
              code: "BAD_REQUEST",
              status: 400,
              field: pgError.column,
              message: `The field ${pgError.column || "unknown"} cannot be empty`,
            },
          }
        );
      }

      // 23514: Check constraint violation
      // Thrown when a check constraint fails (e.g., invalid value range)
      case "23514": {
        throw new GraphQLError(`Invalid value provided for ${mainResource}`, {
          extensions: {
            code: "BAD_REQUEST",
            status: 400,
            message: `The value violates the allowed constraints for ${mainResource}`,
          },
        });
      }
    }
  }

  // Re-throw unknown errors as-is
  throw e;
}

/**
 * Throws a GraphQL error for a resource that was not found
 * @param {string} resource - The name of the resource that wasn't found
 * @throws {GraphQLError} Always throws a NOT_FOUND GraphQL error
 */
export function checkNotFound(resource: string): never {
  throw new GraphQLError(`${resource} not found in database`, {
    extensions: {
      code: "NOT_FOUND",
      status: 404,
      message: `Please check your ${resource} ID and try again`,
    },
  });
}
