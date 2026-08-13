import {resolve} from "path";
import {config} from "dotenv";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {thenBootstraps, catchBootstraps} from "@live-bid/nestjs/nestjs-bootstraps";

config({path: resolve(process.cwd(), "apps/gateway/.env")});

const PORT = Number(process.env.PORT || 3001);
console.log(PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}

bootstrap()
  .then(() => thenBootstraps({
    port: PORT,
    baseUrl: "",
    swaggerUrl: "",
    apiVersion: "",
  }))
  .catch(e => catchBootstraps(e as Error));
