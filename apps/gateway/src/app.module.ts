import {LoggerModule} from "nestjs-pino";
import {ConfigModule} from "@nestjs/config";
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriverConfig} from "@nestjs/apollo";
import {loggerConfig} from "@live-bid/services/lib";
import {APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {MiddlewareConsumer, Module} from '@nestjs/common';
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {AppGraphQLModule} from "@app/gateway/graphql/graphql.module";
import {ClientInfoMiddleware, RpcExceptionInterceptor} from "./common";
import {ComplexityCustom, graphqlConfigs, throttlerConfig} from "@app/gateway/lib";

@Module({
  imports: [
    // Config Service
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/gateway/.env",
    }),

    // Logger Config
    LoggerModule.forRoot(process.env.NODE_ENV !== "production"
      ? loggerConfig
      : undefined
    ),

    // GraphQL Configs
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfigs),

    // Throttle Config for Limits
    ThrottlerModule.forRoot(throttlerConfig),

    // App GraphQL Module
    AppGraphQLModule,
  ],
  providers: [
    ComplexityCustom,

    // Throttle Guard
    {provide: APP_GUARD, useClass: ThrottlerGuard},

    // Rpc Exceptions
    {provide: APP_INTERCEPTOR, useClass: RpcExceptionInterceptor},
  ]
})
export class AppModule {
  // noinspection JSUnusedGlobalSymbols
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientInfoMiddleware).forRoutes("*");
  }
}
