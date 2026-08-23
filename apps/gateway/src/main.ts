import helmet from "helmet";
import {Logger} from "nestjs-pino";
import "@app/gateway/lib/configs/env";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import cookieParser from "cookie-parser";
import {VersioningType} from "@nestjs/common";
import {NestExpressApplication} from "@nestjs/platform-express";
import {catchBootstraps, thenBootstraps} from "@live-bid/services/bootstrap";

const HOST: string = process.env.HOST || '0.0.0.0';
const PORT: number = Number(process.env.PORT || 3001);
const BASE_URL: string = process.env.BASE_URL || 'api';
const API_VERSION: string = process.env.API_VERSION || '1';
const isProduction: boolean = process.env.NODE_ENV === 'production';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction
      ? ["error", "warn"]
      : ["log", "error", "debug", "warn", "verbose", "fatal"],
    bufferLogs: true,
  });

  app.setGlobalPrefix(BASE_URL);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION
  });

  app.enableShutdownHooks();
  app.set("trust proxy", 1);

  app.use(cookieParser());
  app.useLogger(app.get(Logger));

  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false
  }));
  app.enableCors({
    credentials: true,
    origin: isProduction
      ? process.env.FRONT_END_URL
      : process.env.FRONT_END_URL || 'http://localhost:3000',
  });

  await app.listen(PORT, HOST);
}

bootstrap()
  .then(() => thenBootstraps({
    port: PORT,
    graphqlPath: "/graphql",
  }))
  .catch(e => catchBootstraps(e as Error));
