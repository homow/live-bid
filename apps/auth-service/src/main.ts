import {AppModule} from './app.module';
import {colors} from "@live-bid/nestjs";
import {NestFactory} from '@nestjs/core';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST || "0.0.0.0",
        port: 3001,
      },
    },
  );

}

bootstrap()
  .then()
  .catch(e => console.error(`
${colors.bold}${colors.red}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bold}${colors.red}║${colors.reset}  ${colors.bold}${colors.red}❌ FAILED TO START NESTJS APPLICATION ❌${colors.reset}        ${colors.bold}${colors.red}║${colors.reset}
${colors.bold}${colors.red}╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bold}${colors.red}Error Details:${colors.reset}
${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────${colors.reset}

${colors.red}●${colors.reset} ${colors.bold}Message:${colors.reset} ${colors.white}${e}${colors.reset}

${colors.dim}${colors.gray}────────────────────────────────────────────────────────────────${colors.reset}
`));
