import {GraphQLError} from "graphql";
import {ArgumentsHost, Catch} from "@nestjs/common";
import type {GraphQLContext} from "@app/gateway/types";
import {type AppErrorPayload} from "@live-bid/services/lib";
import {GqlArgumentsHost, GqlExceptionFilter} from "@nestjs/graphql";
import {ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME} from "@live-bid/services/names";

/**
 * **GraphqlExceptionFilter**
 *
 * Global exception filter for the GraphQL Gateway.
 * Normalizes all thrown errors into a consistent `GraphQLError` shape
 * and handles auth-cookie cleanup when required.
 *
 * @remarks
 * - **Passthrough:** If the exception is already a `GraphQLError`, it is
 *   returned as-is (no re-wrapping).
 * - **Cookie cleanup:** If the exception payload contains
 *   `meta.clearAuthCookies = true`, both `ACCESS_TOKEN` and `REFRESH_TOKEN`
 *   cookies are cleared on the response before returning the error.
 * - **Known app errors:** Exceptions with `code` and `message` (i.e.,
 *   `AppErrorPayload`) are mapped to a `GraphQLError` preserving
 *   `extensions.code` and `extensions.statusCode`.
 * - **Unknown errors:** Any other exception is returned as a generic
 *   `500 INTERNAL_SERVER_ERROR`, hiding implementation details from clients.
 *
 * @example
 * Client receives:
 * {
 *   "errors": [{
 *     "message": "Your session has been revoked...",
 *     "extensions": { "code": "REFRESH_TOKEN_REVOKED", "statusCode": 401 }
 *   }]
 * }
 */
@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  /**
   * Entry point for the filter. Transforms any thrown exception into a
   * well-structured `GraphQLError` response.
   *
   * @param exception - The thrown exception (may be `AppErrorPayload`, `GraphQLError`, or unknown).
   * @param host      - The NestJS `ArgumentsHost` (GraphQL context).
   * @returns A normalized `GraphQLError`.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof GraphQLError) {
      return exception;
    }

    const payload = exception as AppErrorPayload;

    if (payload?.meta?.clearAuthCookies) {
      const gqlHost = GqlArgumentsHost.create(host);
      const {res} = gqlHost.getContext<GraphQLContext>();
      res.clearCookie(ACCESS_TOKEN_NAME);
      res.clearCookie(REFRESH_TOKEN_NAME);
    }

    if (payload?.code && payload?.message) {
      return new GraphQLError(payload.message, {
        extensions: {
          code: payload.code,
          statusCode: payload.statusCode,
        }
      });
    }

    return new GraphQLError('Internal Server Error', {
      extensions: {
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
