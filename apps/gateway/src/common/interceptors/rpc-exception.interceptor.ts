import {GraphQLError} from "graphql";
import {catchError, Observable, throwError} from "rxjs";
import type {AppErrorPayload} from "@live-bid/services/lib";
import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";

@Injectable()
export class RpcExceptionInterceptor<T> implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<T> | Promise<Observable<T>> {
    return next.handle().pipe(
      catchError((err, _caught) => {
        if (err instanceof GraphQLError) {
          return throwError(() => err);
        }

        const appErrorPayload = err as AppErrorPayload;

        if (appErrorPayload?.code && appErrorPayload?.message) {
          return throwError(() => new GraphQLError(appErrorPayload.message, {
            extensions: {
              code: appErrorPayload.code,
              statusCode: appErrorPayload.statusCode,
            }
          }));
        }

        return throwError(() => new GraphQLError("Internal Server Error", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
          }
        }));
      })
    );
  }
}
