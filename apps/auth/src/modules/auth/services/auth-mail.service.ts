import {Injectable} from "@nestjs/common";
import {MailService, PayloadEventEmail} from "@live-bid/services/modules";
import {NormalizeClientInfoType} from "@live-bid/services/types";
import {buildEmailHtml} from "@live-bid/services/lib";

@Injectable()
export class AuthMailService {
  constructor(private readonly mail: MailService) {}

  /**
   * **Send an authentication-related email.**
   *
   * @param type - "signup" or "login"
   * @param email - recipient email
   * @param dashboardLink
   * @param clientInfo
   */
  authNotification(
    type: "login" | "register",
    email: string,
    dashboardLink: string,
    clientInfo: NormalizeClientInfoType,
  ) {
    const isRegister = type === "register";

    return this.mail.send({
      email,
      force: false,
      subject: isRegister ? "Register Successfully - Live Bid" : "Login Successfully - Live Bid",
      html: buildEmailHtml({
        clientInfo,
        title: isRegister ? "Welcome to Live Bid" : "Login to Live Bid",
        contentName: isRegister ? "welcome" : "login",
        extra: {
          dashboardLink,
          titleText: isRegister ? "Welcome to Live Bid" : "Login Successful",
          messageText: isRegister
            ? "Your account has been successfully created."
            : "You have successfully logged into your account.",
        }
      }),
    });
  }

  forgotPassword(to: string, html: string) {
    return this.mail.send({
      html,
      email: to,
      text: "Reset Your password with token",
      subject: "Reset Password | Live Bid",
    });
  }

  passwordChanged(payload: PayloadEventEmail) {
    return this.mail.send({
      ...payload,
      subject: payload.subject || "Your Password Successfully Changed | Live Bid",
    });
  }
}
