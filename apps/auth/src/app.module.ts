import * as Modules from "./modules";
import {Module} from '@nestjs/common';
import {LoggerModule} from "nestjs-pino";
import {ConfigModule} from "@nestjs/config";
import {loggerConfig} from "@live-bid/services/lib";
import {DrizzleModule} from "@live-bid/services/database";
import * as drizzleSchemas from "@live-bid/services/database/schema";

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

    // App Modules
    Modules.AuthModule,
  ],
})
export class AppModule {}
