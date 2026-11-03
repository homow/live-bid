import {Injectable} from "@nestjs/common";
import {MailService, PayloadEventEmail} from "@live-bid/services/modules";

@Injectable()
export class AuthMailService {
  constructor(private readonly mail: MailService) {}

  signupWelcome(email: string, html: string) {
    return this.mail.send({
      html,
      email,
      force: false,
      subject: "Sign up Successfully - Live Bid",
    });
  }

  forgotPassword(to: string, html: string) {
    return this.mail.send({
      html,
      email: to,
      text: "Reset Your password with token",
      subject: "Reset Password - Live Bid",
    });
  }

  passwordChanged(payload: PayloadEventEmail) {
    return this.mail.send({
      ...payload,
      subject: payload.subject || "Your Password Successfully Changed - Live Bid",
    });
  }
}
