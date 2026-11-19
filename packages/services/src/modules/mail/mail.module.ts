import {Module} from "@nestjs/common";
import {MailService} from "./mail.service";
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({})
export class MailModule {
  // noinspection JSUnusedGlobalSymbols
  static forRoot() {
    return {
      global: true,
      module: MailModule,
      imports: [
        MailerModule.forRootAsync({
          inject: [ConfigService],
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            transport: {
              host: config.get<string>("EMAIL_HOST"),
              service: config.get<string>("EMAIL_SERVICE"),
              secure: config.get<string>("NODE_ENV") === "production",
              port: 587,
              tls: {
                rejectUnauthorized: false,
              },
              auth: {
                user: config.get<string>("EMAIL_USER"),
                pass: config.get<string>("EMAIL_PASS"),
              },
            },
            defaults: {
              from: config.get<string>("EMAIL_FROM"),
            },
          }),
        }),
      ],
      exports: [MailService],
      providers: [MailService],
    };
  }
}
