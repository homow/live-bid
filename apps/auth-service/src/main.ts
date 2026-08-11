import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {catchBootstraps, thenBootstraps} from "@live-bid/nestjs";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3001) || 3001;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: HOST,
        port: PORT,
      },
    },
  );

}

bootstrap()
  .then(() => thenBootstraps({
    baseUrl: "",
    port: PORT,
    apiVersion: "",
    swaggerUrl: "",
  }))
  .catch(e => catchBootstraps(e as Error));
