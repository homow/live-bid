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

  it("hands refresh the whole payload", async () => {
    const payload = {userId: "u1", tokenHash: "h1", client_info: clientInfo};

    await expect(controller.refresh(payload as never)).resolves.toBe("refreshed");
    expect(service.refresh).toHaveBeenCalledWith(payload);
  });

  it("hands logout only the raw token and returns nothing", () => {
    // noinspection JSVoidFunctionReturnValueUsed
    expect(controller.logout({rawRefreshTokenId: "raw-token"}) as never).toBeUndefined();
    expect(service.logout).toHaveBeenCalledWith("raw-token");
  });

  it("hands changePassword the whole payload", async () => {
    const payload = {userId: "u1", oldPassword: "a", newPassword: "b", clientInfo};

    await expect(controller.changePassword(payload as never)).resolves.toBe("changed");
    expect(service.changePassword).toHaveBeenCalledWith(payload);
  });

  it("hands forgotPassword the email and the client info", async () => {
    await expect(controller.forgotPassword({email: "dpk@example.com", clientInfo} as never)).resolves.toBe("forgot");
    expect(service.forgotPassword).toHaveBeenCalledWith("dpk@example.com", clientInfo);
  });

  it("hands resetPassword the whole payload", async () => {
    const payload = {token: "t", newPassword: "n", clientInfo};

    await expect(controller.resetPassword(payload as never)).resolves.toBe("reset");
    expect(service.resetPassword).toHaveBeenCalledWith(payload);
  });

  it.each([
    ["register", AUTH_PATTERNS.REGISTER],
    ["login", AUTH_PATTERNS.LOGIN],
    ["refresh", AUTH_PATTERNS.REFRESH],
    ["logout", AUTH_PATTERNS.LOGOUT],
    ["changePassword", AUTH_PATTERNS.CHANGE_PASSWORD],
    ["forgotPassword", AUTH_PATTERNS.FORGOT_PASSWORD],
    ["resetPassword", AUTH_PATTERNS.RESET_PASSWORD],
  ] as const)("listens for the right pattern on %s", (method, pattern) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(patternOf(AuthController.prototype[method])).toEqual([pattern]);
  });
});

describe("UsersController", () => {
  const service = {
    getPublicProfile: vi.fn().mockResolvedValue("public"),
    getMyProfile: vi.fn().mockResolvedValue("mine"),
    updateProfile: vi.fn().mockResolvedValue("updated"),
    findOne: vi.fn().mockResolvedValue("one"),
    findMany: vi.fn().mockResolvedValue("many"),
  };
  const controller = new UsersController(service as never);

  it("passes the user id through for both profile reads", async () => {
    await expect(controller.getPublicProfile("u1")).resolves.toBe("public");
    await expect(controller.getMyProfile("u1")).resolves.toBe("mine");

    expect(service.getPublicProfile).toHaveBeenCalledWith("u1");
    expect(service.getMyProfile).toHaveBeenCalledWith("u1");
  });

  it("passes the payload through for update, find one and find many", async () => {
    const payload = {userId: "u1"};

    await expect(controller.updateProfile(payload as never)).resolves.toBe("updated");
    await expect(controller.findOne(payload as never)).resolves.toBe("one");
    await expect(controller.findMany(payload as never)).resolves.toBe("many");

    expect(service.updateProfile).toHaveBeenCalledWith(payload);
    expect(service.findOne).toHaveBeenCalledWith(payload);
    expect(service.findMany).toHaveBeenCalledWith(payload);
  });

  it.each([
    ["getPublicProfile", USERS_PATTERNS.PUBLIC_PROFILE],
    ["getMyProfile", USERS_PATTERNS.MY_PROFILE],
    ["updateProfile", USERS_PATTERNS.UPDATE_PROFILE],
    ["findOne", USERS_PATTERNS.FIND_ONE],
    ["findMany", USERS_PATTERNS.FIND_MANY],
  ] as const)("listens for the right pattern on %s", (method, pattern) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(patternOf(UsersController.prototype[method])).toEqual([pattern]);
  });
});

describe("RolesController", () => {
  const service = {modifyRole: vi.fn().mockResolvedValue("modified")};
  const controller = new RolesController(service as never);

  it("passes the payload through to modifyRole", async () => {
    const payload = {actor: {id: "a", role: "OWNER"}, target: {id: "t", newRole: "ADMIN"}};

    await expect(controller.modifyRole(payload as never)).resolves.toBe("modified");
    expect(service.modifyRole).toHaveBeenCalledWith(payload);
  });

  it("listens for the modify-role pattern", () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(patternOf(RolesController.prototype.modifyRole)).toEqual([ROLES_MESSAGES.MODIFY_ROLE]);
  });
});
