import {throwError} from 'rxjs';
import {AppException} from '@live-bid/services/lib';
import {Catch, RpcExceptionFilter, ArgumentsHost} from '@nestjs/common';

const DB_CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
]);

@Catch()
export class DbExceptionFilter implements RpcExceptionFilter {
  isDbConnectionError(e: unknown): boolean {
    const err = e as { code?: string; cause?: { code?: string }; } | null;
    const code = err?.cause?.code ?? err?.code;
    return !!code && DB_CONNECTION_ERROR_CODES.has(code);
  }

  catch(e: Error, _host: ArgumentsHost) {
    if (this.isDbConnectionError(e)) {
      return throwError(() => new AppException({
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database unavailable.'
      }));
    }

    return throwError(() => e instanceof AppException ? e.getError() : e);
  }
}
