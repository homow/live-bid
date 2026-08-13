import "@app/gateway/lib/config/env";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {thenBootstraps, catchBootstraps} from "@live-bid/contracts/nestjs-bootstraps";

const PORT = Number(process.env.PORT || 3001);

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
