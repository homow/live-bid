import type {TablesName} from "../../database";
import {BadRequestException, ConflictException, NotFoundException} from "@nestjs/common";

interface PgErrorLike {
  code?: string;
  constraint?: string;
  table?: string;
  detail?: string;
  column?: string;
}

interface CheckDrizzleErrorParams {
  e: unknown;
  mainResource: TablesName;
  conflictField: string;
  notFoundField?: string;
  notFoundResource?: TablesName;
  restrictResource?: TablesName;
  restrictForeignKey?: string;
}

function extractPgError(e: unknown): PgErrorLike | null {
  if (!(e instanceof Error)) return null;

  const cause = (e as { cause?: unknown }).cause;

  if (cause && typeof cause === "object" && "code" in cause) {
    return cause as PgErrorLike;
  }

  if ("code" in e) {
    return e as unknown as PgErrorLike;
  }

  return null;
}

export function checkDrizzleError(data: CheckDrizzleErrorParams): never {
  const {restrictForeignKey, restrictResource, conflictField, notFoundField, notFoundResource, mainResource, e} = data;

  const pgError = extractPgError(e);

  if (pgError?.code) {
    switch (pgError.code) {
      case "23505": {
        throw new ConflictException({
          message: `${mainResource} already exists in database, please change ${conflictField}`,
          error: `${mainResource} already exists`,
        });
      }

      case "23503": {
        if (restrictForeignKey && restrictResource) {
          throw new BadRequestException({
            message: `Cannot delete ${mainResource} because it has related ${(restrictResource)}. Please remove ${restrictForeignKey} first.`,
            error: `Foreign key constraint failed on ${restrictForeignKey}`,
          });
        }

        throw new NotFoundException({
          message: `${notFoundResource || mainResource} not found or has related records, please check ${notFoundField || "id"}`,
          error: `${notFoundResource || mainResource} not found or has dependencies`,
        });
      }

      case "23502": {
        throw new BadRequestException({
          message: `Missing required field on ${mainResource}${pgError.column ? `: ${pgError.column}` : ""}`,
          error: `Not-null constraint violation`,
        });
      }

      case "23514": {
        throw new BadRequestException({
          message: `Invalid value provided for ${mainResource}`,
          error: `Check constraint violation`,
        });
      }
    }
  }

  throw e;
}

export function checkNotFound(resource: string) {
  throw new NotFoundException({
    message: `${resource} not found in database, please check and try again`,
    error: `${resource} does not exist`
  });
}
