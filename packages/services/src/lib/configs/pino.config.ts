import {Params} from 'nestjs-pino';
import * as crypto from "node:crypto";
import {ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME} from '../../names';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    // ─────────────────────────────────────────────
    // Transport
    // ─────────────────────────────────────────────
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            levelFirst: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            messageKey: 'msg',
            customColors:
              'trace:gray,debug:green,info:blue,warn:yellow,error:red,fatal:magenta',
          },
        },

    // ─────────────────────────────────────────────
    // Request ID
    // ─────────────────────────────────────────────
    genReqId: (req) =>
      req.headers['x-request-id']?.toString() ?? crypto.randomUUID(),

    // ─────────────────────────────────────────────
    // Security
    // ─────────────────────────────────────────────
    redact: {
      paths: [
        // HTTP
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers.set-cookie',

        // Generic body
        'req.body.password',
        'req.body.confirmPassword',
        'req.body.otp',
        'req.body.code',
        'req.body.token',
        'req.body.accessToken',
        'req.body.refreshToken',

        // GraphQL variables
        'req.body.variables.password',
        'req.body.variables.confirmPassword',
        'req.body.variables.otp',
        'req.body.variables.code',
        'req.body.variables.token',
        'req.body.variables.accessToken',
        'req.body.variables.refreshToken',

        `req.body.variables.${ACCESS_TOKEN_NAME}`,
        `req.body.variables.${REFRESH_TOKEN_NAME}`,
      ],
      censor: '[REDACTED]',
    },

    // ─────────────────────────────────────────────
    // HTTP logging
    // ─────────────────────────────────────────────
    autoLogging: {
      ignore: (req) =>
        req.url === '/' ||
        req.url === '/health' ||
        req.url === '/graphql',
    },

    // ─────────────────────────────────────────────
    // Error serialization
    // ─────────────────────────────────────────────
    serializers: {
      err: (err: Error) => ({
        type: err.name,
        message: err.message,
        stack: err.stack,
      }),
    },

    // ─────────────────────────────────────────────
    // Base fields
    // ─────────────────────────────────────────────
    base: {
      service: 'gateway',
      environment: process.env.NODE_ENV ?? 'development',
    },

    messageKey: 'msg',
  },
};
