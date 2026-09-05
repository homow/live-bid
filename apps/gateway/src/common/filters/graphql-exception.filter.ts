import {GraphQLError} from "graphql";
import {ArgumentsHost, Catch} from "@nestjs/common";
import type {GraphQLContext} from "@app/gateway/types";
import {type AppErrorPayload} from "@live-bid/services/lib";
import {GqlArgumentsHost, GqlExceptionFilter} from "@nestjs/graphql";
import {ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME} from "@live-bid/services/names";

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
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

    return new GraphQLError(payload.message, {
      extensions: {
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
