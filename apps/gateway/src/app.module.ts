import {Module} from '@nestjs/common';
import {LoggerModule} from "nestjs-pino";
import {ConfigModule} from "@nestjs/config";
import {GraphQLModule} from "@nestjs/graphql";
import {AppController} from './app.controller';
import {PassportModule} from "@nestjs/passport";
import {ApolloDriverConfig} from "@nestjs/apollo";
import {ThrottlerModule} from "@nestjs/throttler";
import {loggerConfig} from "@live-bid/services/lib";
import {CacheModule} from "@live-bid/services/cache";
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {AppGraphQLModule} from "@app/gateway/graphql/graphql.module";
import {ComplexityCustom, graphqlConfigs, throttlerConfig} from "@app/gateway/lib";
import {AccessTokenGuard, CacheableInterceptor, CacheEvictInterceptor, GraphqlThrottleGuard, RoleGuard, GraphqlExceptionFilter} from "./common";

@Module({
  imports: [
    // Config Service
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/gateway/.env",
    }),

    PassportModule,

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
    {provide: APP_FILTER, useClass: GraphqlExceptionFilter},

    // Access Token Guard
    {provide: APP_GUARD, useClass: AccessTokenGuard},

    // Role Guard
    {provide: APP_GUARD, useClass: RoleGuard},

    // Cacheable and Cache-Evict Interceptors
    {provide: APP_INTERCEPTOR, useClass: CacheableInterceptor},
    {provide: APP_INTERCEPTOR, useClass: CacheEvictInterceptor},
  ],
  controllers: [AppController]
})
export class AppModule {}
