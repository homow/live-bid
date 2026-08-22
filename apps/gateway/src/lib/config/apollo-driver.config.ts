import path from "node:path";
import "@app/gateway/lib/config/env";
import type {GraphQLContext} from "@app/gateway/types";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";

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

  context: ({req, res}: GraphQLContext) => ({req, res}),

  formatError: formattedError => ({
    message: formattedError.message,
    code: formattedError.extensions?.code,
    reason: formattedError.extensions?.errors,
    originalError: formattedError.extensions?.originalError,
  }),
};
