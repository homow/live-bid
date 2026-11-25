import "reflect-metadata";
import {describe, expect, it, vi} from "vitest";
import {PATTERN_METADATA} from "@nestjs/microservices/constants";

import {AuthController} from "./auth/auth.controller";
import {UsersController} from "./users/users.controller";
import {RolesController} from "./roles/roles.controller";
import {AUTH_PATTERNS, ROLES_MESSAGES, USERS_PATTERNS} from "@live-bid/services/messages";

/**
 * The controllers are supposed to be thin: pick the right pieces out of the
 * payload, call one service method, return its result. These tests pin exactly that,
 * including which message pattern lands on which handler.
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const patternOf = (handler: unknown) => Reflect.getMetadata(PATTERN_METADATA, handler as object);

const clientInfo = {ip: "203.0.113.7"};

describe("AuthController", () => {
  const service = {
    register: vi.fn().mockResolvedValue("registered"),
    login: vi.fn().mockResolvedValue("logged-in"),
    refresh: vi.fn().mockResolvedValue("refreshed"),
    logout: vi.fn(),
    changePassword: vi.fn().mockResolvedValue("changed"),
    forgotPassword: vi.fn().mockResolvedValue("forgot"),
    resetPassword: vi.fn().mockResolvedValue("reset"),
  };
  const controller = new AuthController(service as never);

  it("hands register the input and the client info", async () => {
    const input = {email: "dpk@example.com"};

    await expect(controller.register({input, clientInfo} as never)).resolves.toBe("registered");
    expect(service.register).toHaveBeenCalledWith(input, clientInfo);
  });

  it("hands login the credentials and the client info", async () => {
    const userData = {email: "dpk@example.com", password: "x", remember: false};

    await expect(controller.login({userData, clientInfo} as never)).resolves.toBe("logged-in");
    expect(service.login).toHaveBeenCalledWith(userData, clientInfo);
  });
});
