import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {buildEmailHtml} from "@live-bid/services/lib";
import {MailService} from "@live-bid/services/modules";
import {NormalizeClientInfoType} from "@live-bid/services/types";

@Injectable()
export class AuthMailService {
  APPLICATION_NAME: string;
  APPLICATION_URL: string;
  APPLICATION_LOGIN_URL: string;
  APPLICATION_FORGOT_PASSWORD_URL: string;

  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {
    this.APPLICATION_URL = this.config.get<string>('APPLICATION_URL') ?? "http://localhost:127.0.0.1";
    this.APPLICATION_NAME = this.config.get<string>('APPLICATION_NAME') ?? "Live Bid";
    this.APPLICATION_LOGIN_URL = this.config.get<string>("APPLICATION_LOGIN_URL")
      ?? `${this.APPLICATION_URL}/login`;
    this.APPLICATION_FORGOT_PASSWORD_URL = this.config.get<string>("APPLICATION_FORGOT_PASSWORD_URL")
      ?? `${this.APPLICATION_URL}/forgot-password`;
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
      subject: isRegister ? `Register Successfully - ${this.APPLICATION_NAME}` : `Login Successfully - ${this.APPLICATION_NAME}`,
      html: buildEmailHtml({
        clientInfo,
        title: isRegister ? `Welcome to ${this.APPLICATION_NAME}` : `Login to ${this.APPLICATION_NAME}`,
        contentName: isRegister ? "welcome" : "login",
        extra: {
          dashboardLink,
          titleText: isRegister ? `Welcome to ${this.APPLICATION_NAME}` : "Login Successful",
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
    action: 'reset' | 'change' = 'change'
  ) {
    return this.mail.send({
      email,
      force: false,
      subject: `Your password successfully ${action} - ${this.APPLICATION_NAME}`,
      html: buildEmailHtml({
        clientInfo,
        title: `Password ${action} successfully`,
        contentName: "changed-password",
        extra: {
          loginLink: `${this.APPLICATION_LOGIN_URL}`,
          resetLink: `${this.APPLICATION_FORGOT_PASSWORD_URL}`,
          titleText: `Your Password Has Been ${action}`,
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
      subject: `Reset Your Password - ${this.APPLICATION_NAME}`,
      html: buildEmailHtml({
        clientInfo,
        title: "Reset Your Password",
        contentName: "forgot-password",
        extra: {
          resetLink: `${this.APPLICATION_FORGOT_PASSWORD_URL}?token=${resetToken}`,
          expireMinutes: expireMinutes.toString(),
          titleText: "Reset Your Password",
          messageText: "We received a request to reset the password for your account.",
        },
      }),
    });
  }
}
