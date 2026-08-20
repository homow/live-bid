import * as Modules from "./modules";
import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {DrizzleModule} from "@live-bid/services/database";
import * as drizzleSchemas from "@live-bid/services/database/schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/auth/.env",
    }),

    DrizzleModule.forRoot(drizzleSchemas),

    // App Modules
    Modules.AuthModule,
  ],
})
export class AppModule {}
