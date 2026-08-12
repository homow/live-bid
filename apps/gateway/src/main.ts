import {resolve} from "path";
import {config} from "dotenv";
import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';

config({path: resolve(process.cwd(), "apps/gateway/.env")});

const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}

bootstrap();
