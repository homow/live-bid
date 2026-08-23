import "@app/gateway/lib/configs/env";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {thenBootstraps, catchBootstraps} from "@live-bid/services/bootstrap";

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, HOST);
}

bootstrap()
  .then(() => thenBootstraps({
    port: PORT,
    graphqlPath: "/graphql",
  }))
  .catch(e => catchBootstraps(e as Error));
