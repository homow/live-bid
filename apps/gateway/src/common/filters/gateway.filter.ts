import {GraphQLError} from "graphql";
import {AppErrorPayload} from "@live-bid/services/lib";

export class GatewayException extends GraphQLError {
  private readonly code: string;
  private readonly statusCode: number;

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
