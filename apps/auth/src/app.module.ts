import * as Modules from "./modules";
import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/auth/.env",
    }),

    // App Modules
    Modules.AuthModule,
  ],
})
export class AppModule {}
