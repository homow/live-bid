import {LoggerModule} from "nestjs-pino";
import {ConfigModule} from "@nestjs/config";
import {GraphQLModule} from "@nestjs/graphql";
import { AppController } from './app.controller';
import {ApolloDriverConfig} from "@nestjs/apollo";
import {ThrottlerModule} from "@nestjs/throttler";
import {loggerConfig} from "@live-bid/services/lib";
import {CacheModule} from "@live-bid/services/cache";
import {APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppGraphQLModule} from "@app/gateway/graphql/graphql.module";
import {ComplexityCustom, graphqlConfigs, throttlerConfig} from "@app/gateway/lib";
import {AccessTokenGuard, ClientInfoMiddleware, GraphqlThrottleGuard, RoleGuard, RpcExceptionInterceptor} from "./common";

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

    // Cache Module
    CacheModule,

    // App GraphQL Module
    AppGraphQLModule,
  ],
  providers: [
    ComplexityCustom,

    // Throttle Guard
    {provide: APP_GUARD, useClass: GraphqlThrottleGuard},

    // Rpc Exceptions
    {provide: APP_INTERCEPTOR, useClass: RpcExceptionInterceptor},

    // Access Token Guard
    {provide: APP_GUARD, useClass: AccessTokenGuard},

    // Role Guard
    {provide: APP_GUARD, useClass: RoleGuard}
  ],
  controllers: [AppController]
})
export class AppModule {
  // noinspection JSUnusedGlobalSymbols
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientInfoMiddleware).forRoutes("*");
  }
}
