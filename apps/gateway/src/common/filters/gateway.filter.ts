import {GraphQLError} from "graphql";
import {AppErrorPayload} from "@live-bid/services/lib";

/**
 * **GatewayException**
 *
 * Custom GraphQL exception used within the API Gateway layer.
 * Encapsulates an `AppErrorPayload` and maps it directly into a
 * standard GraphQL error response.
 *
 * @remarks
 * - Extends `GraphQLError` so it is natively compatible with GraphQL's
 *   error-handling system.
 * - The `code` and `statusCode` are exposed to clients via
 *   `extensions` in the GraphQL response.
 * - This is the **preferred exception** for throwing errors from guards,
 *   resolvers, and pipes in the Gateway (rather than raw `Error` or `GraphQLError`).
 *
 * @example
 * // In a guard or resolver:
 * throw new GatewayException({
 *   statusCode: 403,
 *   code: "ROLE_NOT_ALLOWED",
 *   message: "Access denied. You don't have the required role.",
 * });
 *
 * // Client receives:
 * {
 *   "errors": [{
 *     "message": "Access denied. You don't have the required role.",
 *     "extensions": {
 *       "code": "ROLE_NOT_ALLOWED",
 *       "statusCode": 403
 *     }
 *   }]
 * }
 */
export class GatewayException extends GraphQLError {
  private readonly code: string;
  private readonly statusCode: number;

  /**
   * @param payload - Standard application error payload:
   *   - `message`: Human-readable error message.
   *   - `code`: Machine-readable error code (e.g., `ROLE_NOT_ALLOWED`).
   *   - `statusCode`: HTTP-like status code (e.g., 400, 401, 403, 500).
   */
  constructor(payload: AppErrorPayload) {
    super(payload.message, {
      extensions: {
        code: payload.code,
        statusCode: payload.statusCode,
      }
    });

    this.code = payload.code;
    this.statusCode = payload.statusCode;

    void this.code;
    void this.statusCode;
  }
}
