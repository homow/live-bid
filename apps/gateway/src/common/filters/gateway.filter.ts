import {GraphQLError} from "graphql";

export interface GatewayExceptionPayload {
  code: string;
  message: string;
  statusCode: number;
}

export class GatewayException extends GraphQLError {
  private readonly code: string;
  private readonly statusCode: number;

  constructor(payload: GatewayExceptionPayload) {
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
