import {throwError} from 'rxjs';
import {AppException} from '@live-bid/services/lib';
import {Catch, RpcExceptionFilter, ArgumentsHost} from '@nestjs/common';

@Catch()
export class DbExceptionFilter implements RpcExceptionFilter {
  catch(e: Error, _host: ArgumentsHost) {
    if (e instanceof AppException) {
      console.log(e.getError());
      return throwError(() => e.getError());
    }

    const error = e as Error & {
      cause?: {
        code?: string;
      };
    };

    if (error?.cause?.code === 'ECONNREFUSED') {
      return throwError(() => new AppException({
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database unavailable.'
      }).getError());
    }

    return throwError(() => new AppException({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      message: 'Unexpected database error.'
    }).getError());
  }
}
