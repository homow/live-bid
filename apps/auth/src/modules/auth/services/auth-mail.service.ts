import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {buildEmailHtml} from "@live-bid/services/lib";
import {MailService} from "@live-bid/services/modules";
import {NormalizeClientInfoType} from "@live-bid/services/types";

@Injectable()
export class AuthMailService {
  FRONTEND_NAME: string;
  FRONTEND_ADDRESS: string;
  FRONTEND_LOGIN_ADDRESS: string;
  FRONTEND_FORGOT_PASSWORD_ADDRESS: string;

  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {
    this.FRONTEND_ADDRESS = this.config.get<string>('FRONTEND_ADDRESS') ?? "http://localhost:127.0.0.1";
    this.FRONTEND_NAME = this.config.get<string>('FRONTEND_NAME') ?? "Live Bid";
    this.FRONTEND_LOGIN_ADDRESS = this.config.get<string>("FRONTEND_LOGIN_ADDRESS")
      ?? `${this.FRONTEND_ADDRESS}/login`;
    this.FRONTEND_FORGOT_PASSWORD_ADDRESS = this.config.get<string>("FRONTEND_FORGOT_PASSWORD_ADDRESS")
      ?? `${this.FRONTEND_ADDRESS}/forgot-password`;
  }

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
      subject: isRegister ? `Register Successfully - ${this.FRONTEND_NAME}` : `Login Successfully - ${this.FRONTEND_NAME}`,
      html: buildEmailHtml({
        clientInfo,
        title: isRegister ? `Welcome to ${this.FRONTEND_NAME}` : `Login to ${this.FRONTEND_NAME}`,
        contentName: isRegister ? "welcome" : "login",
        extra: {
          dashboardLink,
          titleText: isRegister ? `Welcome to ${this.FRONTEND_NAME}` : "Login Successful",
          messageText: isRegister
            ? "Your account has been successfully created."
            : "You have successfully logged into your account.",
        }
      }),
    });
  }

  /**
   * **Send password-changed confirmation email.**
   *
   * Called after a successful password change/reset.
   */
  passwordChangedNotification(
    email: string,
    clientInfo: NormalizeClientInfoType,
  ) {
    return this.mail.send({
      email,
      force: false,
      subject: `Your Password Successfully Changed - ${this.FRONTEND_NAME}`,
      html: buildEmailHtml({
        clientInfo,
        title: "Password Changed Successfully",
        contentName: "changed-password",
        extra: {
          loginLink: `${this.FRONTEND_LOGIN_ADDRESS}`,
          resetLink: `${this.FRONTEND_FORGOT_PASSWORD_ADDRESS}`,
          titleText: "Your Password Has Been Changed",
          messageText: "Your password was updated successfully. You can now log in with your new password.",
        },
      }),
    });
  }

  /**
   * **Send password-reset link email.**
   *
   * Called when a user requests to reset their forgotten password.
   *
   * @param email - The recipient's email address.
   * @param resetToken - The raw reset token to embed in the reset link.
   * @param clientInfo - Normalized client metadata for the email footer.
   * @param expireMinutes - The token's validity duration (default: 15).
   */
  forgotPasswordNotification(
    email: string,
    resetToken: string,
    clientInfo: NormalizeClientInfoType,
    expireMinutes: number = 15,
  ) {
    return this.mail.send({
      email,
      force: false,
      subject: `Reset Your Password - ${this.FRONTEND_NAME}`,
      html: buildEmailHtml({
        clientInfo,
        title: "Reset Your Password",
        contentName: "forgot-password",
        extra: {
          resetLink: `${this.FRONTEND_FORGOT_PASSWORD_ADDRESS}?token=${resetToken}`,
          expireMinutes: expireMinutes.toString(),
          titleText: "Reset Your Password",
          messageText: "We received a request to reset the password for your account.",
        },
      }),
    });
  }
}
