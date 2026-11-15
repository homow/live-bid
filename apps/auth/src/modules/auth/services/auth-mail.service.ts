import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {buildEmailHtml} from "@live-bid/services/lib";
import {MailService} from "@live-bid/services/modules";
import {NormalizeClientInfoType} from "@live-bid/services/types";

/**
 * **AuthMailService**
 *
 * Builds and dispatches authentication-related transactional emails
 * (registration, login alerts, password changes, and password reset links).
 *
 * @remarks
 * - Wraps the shared `MailService` and injects the application's branding
 *   (`APPLICATION_NAME`, `APPLICATION_URL`, etc.) resolved from `ConfigService`.
 * - Each method composes the email via `buildEmailHtml`, passing `clientInfo`
 *   so the template can render security metadata (IP, device, geo).
 * - Login/register and reset emails use `force: false` (respecting user
 *   notification preferences), while security-alert emails use `force: true`.
 *
 * ### Available emails
 * | Method | Trigger | Forced |
 * |---|---|---|
 * | `authNotification` | Register / Login | ❌ |
 * | `passwordChangedNotification` | Password change / reset | ❌ |
 * | `forgotPasswordNotification` | Password reset request | ✅ |
 */
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
   * Sends a welcome (register) or login-alert email.
   *
   * @param type - Email variant: `register` (welcome) or `login` (alert).
   * @param email - Recipient address.
   * @param dashboardLink - URL to the user's dashboard, embedded in the email.
   * @param clientInfo - Client metadata rendered in the email footer.
   * @returns The underlying `MailService.send` promise.
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
   * Sends a security-alert email after a successful password change or reset.
   *
   * This email is always forced (ignores notification preferences) because
   * it is security-critical.
   *
   * @param email - Recipient address.
   * @param clientInfo - Client metadata rendered in the email footer.
   * @param action - Whether the password was `change`d or `reset` (affects copy).
   * @returns The underlying `MailService.send` promise.
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
   * Sends the password-reset link email.
   *
   * @param email - Recipient address.
   * @param resetToken - Raw reset token embedded in the reset URL.
   * @param clientInfo - Client metadata rendered in the email footer.
   * @param expireMinutes - Token validity (minutes) shown in the email.
   * @returns The underlying `MailService.send` promise.
   */
  forgotPasswordNotification(
    email: string,
    resetToken: string,
    clientInfo: NormalizeClientInfoType,
    expireMinutes: number = 15,
  ) {
    return this.mail.send({
      email,
      force: true,
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
