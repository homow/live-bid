import {RpcException} from '@nestjs/microservices';

export interface AppErrorPayload {
  code: string;
  message: string;
  statusCode: number;
  meta?: {
    clearAuthCookies?: boolean;
  }
}

export class AppException extends RpcException {
  constructor(payload: AppErrorPayload) {
    super(payload);
  }
}
