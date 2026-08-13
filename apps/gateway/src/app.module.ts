import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME} from "@live-bid/nestjs/services/names";

console.log(process.env.NODE_ENV);

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: () => ({
          transport: Transport.REDIS,
          options: {host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT || 6973)}
        })
      }
    ]),
  ],
})
export class AppModule {}
