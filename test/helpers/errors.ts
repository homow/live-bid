import {expect} from "vitest";
import {AppException, type AppErrorPayload} from "@live-bid/services/lib";

/** Awaits a call that should reject and hands back the payload of the AppException it threw */
export async function appErrorOf(promise: Promise<unknown>): Promise<AppErrorPayload> {
  const error = await promise.then(
    () => {
      throw new Error("Expected the call to reject, but it resolved");
    },
    (e: unknown) => e,
  );

  expect(error).toBeInstanceOf(AppException);
  return (error as AppException).getError() as AppErrorPayload;
}

/** Awaits a query that should fail and returns the Postgres error code (like "23505") */
export async function pgErrorCode(promise: Promise<unknown>): Promise<string | undefined> {
  const error = await promise.then(
    () => {
      throw new Error("Expected the query to fail, but it succeeded");
    },
    (e: unknown) => e,
  );

  // Drizzle wraps the driver error and keeps the original under `cause`
  const pgError = error as {code?: string; cause?: {code?: string}};
  return pgError.cause?.code ?? pgError.code;
}
