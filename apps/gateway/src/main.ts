import "@app/gateway/lib/config/env";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {GraphqlFilter} from "@app/gateway/common/filters";
import {thenBootstraps, catchBootstraps} from "@live-bid/contracts/nestjs-bootstraps";

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GraphqlFilter());

  await app.listen(PORT, HOST);
}

bootstrap()
  .then(() => thenBootstraps({
    port: PORT,
    graphqlPath: "/graphql",
  }))
  .catch(e => catchBootstraps(e as Error));
