import {Module} from '@nestjs/common';
import {GraphQLModule} from "@nestjs/graphql";
import {graphqlConfigs} from "@app/gateway/lib";
import {ApolloDriverConfig} from "@nestjs/apollo";
import {AppResolver} from "@app/gateway/app.resolver";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME, CORE_SERVICE_NAME} from "@live-bid/contracts/services/names";

@Module({
  imports: [
    // Config Service
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/gateway/.env",
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfigs),

    // Client Services
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: config.get<string>("REDIS_HOST"),
            port: Number(config.get<string>("REDIS_PORT") || 6973),
            retryAttempts: 5,
            retryDelay: 1000,
            retryStrategy: () => 1000
          },
        }),
        inject: [ConfigService]
      },
      {
        name: CORE_SERVICE_NAME,
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: config.get<string>("REDIS_HOST"),
            port: Number(config.get<string>("REDIS_PORT") || 6973),
            retryAttempts: 5,
            retryDelay: 1000,
            retryStrategy: () => 1000
          },
        }),
        inject: [ConfigService]
      }
    ]),
  ],
  providers: [
    AppResolver,
  ]
})
export class AppModule {}
