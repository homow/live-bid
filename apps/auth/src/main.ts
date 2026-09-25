import "@app/auth/lib/config/env";
import {AppModule} from "./app.module";
import {NestFactory} from "@nestjs/core";
import {DbExceptionFilter} from "@live-bid/services/common";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {microserviceCatch, microserviceBootstraps,} from "@live-bid/services/bootstrap";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379) || 6379;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryAttempts: 5,
        retryDelay: 1000,
        retryStrategy: () => 1000,
      },
    },
  );

  app.useGlobalFilters(new DbExceptionFilter());

  await app.listen();
}

bootstrap()
  .then(() =>
    microserviceBootstraps({
      serviceName: "Auth",
      transport: "Redis",
      mode: "microservice",
    }),
  )
  .catch((e) =>
    microserviceCatch({
      transport: "Redis",
      serviceName: "Auth",
      error: e as Error,
    }),
  );
