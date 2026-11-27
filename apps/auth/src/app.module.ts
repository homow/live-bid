import * as Modules from "./modules";
import {Module} from '@nestjs/common';
import {LoggerModule} from "nestjs-pino";
import {loggerConfig} from "@live-bid/services/lib";
import {CacheModule} from "@live-bid/services/cache";
import {CORE_SERVICE_NAME} from "@live-bid/services/names";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientsModule, Transport} from "@nestjs/microservices";
import * as drizzleSchemas from "@live-bid/services/database/schema";
import {DrizzleModule, MailModule} from "@live-bid/services/modules";

@Module({
  imports: [
    // Env Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/auth/.env",
    }),

    // Config Core Microservice
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: CORE_SERVICE_NAME,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            transport: Transport.REDIS,
            options: {
              host: config.get<string>('REDIS_HOST'),
              port: Number(config.get<string>('REDIS_PORT') || 6379),
              retryAttempts: 5,
              retryDelay: 1000,
            }
          })
        }
      ]
    }),

    // Logger Config
    LoggerModule.forRoot(process.env.NODE_ENV !== "production"
      ? loggerConfig
      : undefined
    ),

    // Drizzle Module
    DrizzleModule.forRoot(drizzleSchemas),

    // Mail Module
    MailModule.forRoot(),

    // Cache Module
    CacheModule,

    // App Modules
    Modules.AuthModule,
    Modules.UsersModule,
    Modules.RolesModule,
  ],
})
export class AppModule {}
