import path from "node:path";
import "@app/gateway/lib/config/env";
import type {Request, Response} from "express";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";

interface RequestAndResponse {
  req: Request;
  res: Response;
}

const isProduction: boolean = process.env.NODE_ENV === "production";

export const graphqlConfigs: ApolloDriverConfig = {
  autoSchemaFile: path.resolve(process.cwd(), './schema.graphql'),
  graphiql: !isProduction,
  sortSchema: true,
  playground: false,
  driver: ApolloDriver,
  introspection: !isProduction,
  stopOnApplicationShutdown: true,

  subscriptions: {
    "graphql-ws": true
  },

  context: ({req, res}: RequestAndResponse) => ({req, res}),

  formatError: formattedError => ({
    message: formattedError.message,
    code: formattedError.extensions?.code,
    reason: formattedError.extensions?.errors,
    originalError: formattedError.extensions?.originalError,
  }),
};
