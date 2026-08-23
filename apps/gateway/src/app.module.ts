import {LoggerModule} from "nestjs-pino";
import {ConfigModule} from "@nestjs/config";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriverConfig} from "@nestjs/apollo";
import {ThrottlerModule} from "@nestjs/throttler";
import {loggerConfig} from "@live-bid/services/lib";
import {MiddlewareConsumer, Module} from '@nestjs/common';
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

    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor
    }
  ]
})
export class AppModule {
  // noinspection JSUnusedGlobalSymbols
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientInfoMiddleware).forRoutes("*");
  }
}
