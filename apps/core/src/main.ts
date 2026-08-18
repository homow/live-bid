import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {microserviceBootstraps, microserviceCatch} from "@live-bid/contracts/nestjs-bootstraps";

const REDS_HOST = process.env.REDS_HOST || "127.0.0.1";
const REDS_PORT = Number(process.env.REDS_PORT || 6379) || 6379;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: REDS_HOST,
        port: REDS_PORT,
        retryAttempts: 5,
        retryDelay: 1000,
        retryStrategy: () => 1000
      }
    }
  );

  await app.listen();
}

bootstrap()
  .then(() => microserviceBootstraps({
    serviceName: "Core",
    transport: 'Redis',
    mode: 'microservice'
  }))
  .catch(e => microserviceCatch({
    transport: "Redis",
    serviceName: "Core",
    error: e as Error,
  }));
