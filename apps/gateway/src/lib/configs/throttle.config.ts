import {ONE_MINUTE_MS} from "@live-bid/services/lib";
import type {ThrottlerModuleOptions} from "@nestjs/throttler";

const isProduction: boolean = process.env.NODE_ENV === "production";

const blockDuration: number = isProduction ? ONE_MINUTE_MS * 2 : ONE_MINUTE_MS;

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [{
    ttl: isProduction ? ONE_MINUTE_MS : ONE_MINUTE_MS / 6,
    limit: isProduction ? 30 : 1000,
    blockDuration
  }],
  errorMessage: (): string => `Too many requests. Try again ${blockDuration / ONE_MINUTE_MS} minutes later.`,
};
