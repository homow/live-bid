/** base response for exceptions and ok responses */
export interface BaseResponse {
  success: boolean;
  statusCode: number;
  detail: string;
  timestamp: string;
  path?: string;
}

/** params type for get schema for swagger when zod validate not success */
export interface ZodFieldError {
  field: string;
  error: string;
}

/** base error type */
export interface BaseException {
  message: string;
  error: string;
}

/** type of zod error response */
export interface ZodException {
  message: string;
  errors: ZodFieldError[];
}

/** base exception response */
export type ZodExceptionRes = & BaseResponse & ZodException;

export type BaseExceptionRes = & BaseResponse & BaseException & {
  [key: string]: unknown;
};
