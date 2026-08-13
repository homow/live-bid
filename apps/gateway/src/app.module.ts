import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/nestjs/services/names";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: () => ({
          transport: Transport.REDIS,
          options: {}
        })
      }
    ]),
  ],
})
export class AppModule {}
