import "@app/auth/lib/config/env";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {catchBootstraps, thenBootstraps} from "@live-bid/contracts/nestjs-bootstraps";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3002) || 3002;

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

  await app.listen();
}

bootstrap()
  .then(() => thenBootstraps({
    port: PORT,
    baseUrl: "",
    apiVersion: "",
    swaggerUrl: "",
  }))
  .catch(e => catchBootstraps(e as Error));
