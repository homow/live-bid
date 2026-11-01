import {Injectable} from "@nestjs/common";
import {MailService, PayloadEventEmail} from "@live-bid/services/modules";

@Injectable()
export class AuthMailService {
  constructor(private readonly mail: MailService) {}

  signupWelcome(payload: PayloadEventEmail) {
    return this.mail.send({
      force: false,
      html: payload.html,
      email: payload.email,
      subject: payload.subject,
    });
  }

  forgotPassword(to: string, html: string) {
    return this.mail.send({
      html,
      email: to,
      text: "Reset Your password with token",
      subject: "Reset Password - Car Service",
    });
  }

  passwordChanged(payload: PayloadEventEmail) {
    return this.mail.send({
      html: payload.html,
      email: payload.email,
      subject: payload.subject || "Your Password Successfully Changed - Car Service",
    });
  }
}
