import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {MailerService} from "@nestjs-modules/mailer";

interface PayloadEventEmail {
  html: string;
  email: string;
  force?: boolean;
  subject?: string;
}

@Injectable()
export class MailService {
  private readonly defaultFrom: string;
  private readonly defaultReplay: string;
  private readonly emailNotification: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    this.defaultFrom = this.config.get<string>("EMAIL_FROM") ?? "";
    this.defaultReplay = this.config.get<string>("EMAIL_REPLAY") ?? "";
    this.emailNotification = this.config.get<string>("EMAIL_NOTIFICATIONS_ENABLED") ?? "";
  }

  isEmailEnabled(): boolean {
    return this.emailNotification.toLowerCase() === "true";
  }

  send({force = true, ...payload}: PayloadEventEmail) {
    if (!force && !this.isEmailEnabled()) return;

    return this.mailer.sendMail({
      to: payload.email,
      html: payload.html,
      from: this.defaultFrom,
      subject: payload.subject,
      replyTo: this.defaultReplay,
    });
  }
}
