import {Module} from "@nestjs/common";
import * as Resolvers from "./resolvers";
import {ConfigService} from "@nestjs/config";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME, CORE_SERVICE_NAME} from "@live-bid/contracts/services/names";

@Module({
  imports: [
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
    Resolvers.AuthResolver
  ],
})
export class AppGraphQLModule {}
