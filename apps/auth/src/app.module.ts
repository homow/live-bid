import * as Modules from "./modules";
import {Module} from '@nestjs/common';
import {LoggerModule} from "nestjs-pino";
import {ConfigModule} from "@nestjs/config";
import {loggerConfig} from "@live-bid/services/lib";
import {CacheModule} from "@live-bid/services/cache";
import * as drizzleSchemas from "@live-bid/services/database/schema";
import {DrizzleModule, MailModule} from "@live-bid/services/modules";

@Module({
  imports: [
    // Env Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/auth/.env",
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
  ],
})
export class AppModule {}
