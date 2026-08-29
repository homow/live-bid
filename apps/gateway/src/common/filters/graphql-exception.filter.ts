import {ArgumentsHost, Catch} from "@nestjs/common";
import {GqlExceptionFilter} from "@nestjs/graphql";
import {GraphQLError} from "graphql";
import {AppErrorPayload} from "@live-bid/services/lib";

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof GraphQLError) {
      return exception;
    }

    const payload = exception as AppErrorPayload;

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
