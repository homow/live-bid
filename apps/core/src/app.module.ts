import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {DrizzleModule} from "@live-bid/services/database";
import * as drizzleSchemas from "@live-bid/services/database/schema";

@Module({
  imports: [
    // Env Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/core/.env",
    }),

    // Drizzle Module
    DrizzleModule.forRoot(drizzleSchemas),
  ],
})
export class AppModule {}
