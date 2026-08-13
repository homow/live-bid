import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/nestjs/services/names";

@Module({
  imports: [
    // Config Service
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/gateway/.env",
    }),

    // Client Services
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {host: config.get<string>("REDIS_HOST"), port: Number(config.get<string>("REDIS_PORT") || 6973)}
        }),
        inject: [ConfigService]
      }
    ]),
  ],
})
export class AppModule {}
