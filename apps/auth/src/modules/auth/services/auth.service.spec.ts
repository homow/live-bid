import {TokenUtil} from "../utils";
import {Test} from "@nestjs/testing";
import {hash, compare} from "bcrypt";
import {PinoLogger} from "nestjs-pino";
import {createHash} from "node:crypto";
import {AuthService} from "./auth.service";
import {ConfigService} from "@nestjs/config";
import {AuthRepository} from "../auth.repository";
import {AuthMailService} from "./auth-mail.service";
import type {User} from "@live-bid/services/database";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {AUTH_EVENTS} from "@live-bid/services/events";
import {DrizzleService} from "@live-bid/services/modules";
import {CORE_SERVICE_NAME} from "@live-bid/services/names";
import {UsersCacheService} from "@app/auth/modules/users/services";
import {beforeAll, beforeEach, describe, expect, it, vi} from "vitest";
import {UsersRepository} from "@app/auth/modules/users/users.repository";
import {AppException, type AppErrorPayload} from "@live-bid/services/lib";
import type {LoginUserSchemaType, RegisterUserSchemaType} from "@live-bid/contracts/schemas";
import type {AccessTokenPayload, NormalizeClientInfoType, SafeUser} from "@live-bid/services/types";

/**
 * Unit tests for AuthService (register + login).
 *
 * Everything around the service is mocked, so no Postgres or Redis is touched.
 * The only real piece is bcrypt, because "is the password really hashed?"
 * is something a mock can't tell us.
 */
const PASSWORD = "Str0ng!Passw0rd";

const clientInfo: NormalizeClientInfoType = {
  ip: "203.0.113.7",
  browser: "Firefox",
  os: "Linux",
  device: "desktop",
  country: "US",
  city: "Chicago",
  lang: "en",
};

const safeUser: SafeUser = {
  id: "01900000-0000-7000-8000-000000000001",
  role: UserRoleEnum.USER,
  email: "dpk@example.com",
  username: null,
  is_active: true,
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
  display_name: "dpk",
};

const TOKENS = {
  accessToken: "access.jwt.token",
  refreshToken: "user-id:raw-refresh-token",
  hashedRefreshToken: "sha256-of-the-refresh-token",
  expires_in: new Date("2026-12-01T00:00:00Z"),
};

// Two different objects so we can tell which cookie options ended up where
const ACCESS_COOKIE = {httpOnly: true, maxAge: 1};
const REFRESH_COOKIE = {httpOnly: true, maxAge: 2};

// Stands in for the drizzle transaction object, we only check it gets passed along
const TX = {tag: "tx"};

/** A refresh_tokens row as the repository returns it (public columns only) */
const refreshRecord = (overrides: Record<string, unknown> = {}) => ({
  id: "rt-1",
  user_id: safeUser.id,
  token_hash: "hash-1",
  is_revoked: false,
  expires_in: inOneHour(),
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-01-01T00:00:00Z"),
  remember_me: false,
  replace_by_token_id: null,
  ...overrides,
});

const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000);

function createMocks() {
  return {
    logger: {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()},
    config: {get: vi.fn()},
    tokenUtil: {
      getAccessAndRefreshTokens: vi.fn().mockReturnValue(TOKENS),
      getCookieOptions: vi.fn((type: string) => (type === "access" ? ACCESS_COOKIE : REFRESH_COOKIE)),
      setPwdToken: vi.fn(),
      verifyPwdToken: vi.fn(),
    },
    authMail: {
      authNotification: vi.fn().mockResolvedValue(undefined),
      passwordChangedNotification: vi.fn().mockResolvedValue(undefined),
      forgotPasswordNotification: vi.fn().mockResolvedValue(undefined),
    },
    authRepository: {
      insertRefreshToken: vi.fn().mockResolvedValue(undefined),
      findRefreshRecord: vi.fn(),
      findRefreshRecordWithUser: vi.fn(),
      rotateToken: vi.fn(),
      revokeToken: vi.fn().mockResolvedValue(undefined),
      revokeAllUserTokens: vi.fn().mockResolvedValue(undefined),
      changePassword: vi.fn().mockResolvedValue(undefined),
    },
    usersRepository: {insertUser: vi.fn(), findOne: vi.fn()},
    usersCache: {
      incrementUserListVersion: vi.fn(),
      setCacheUserInfo: vi.fn(),
      getCachedUserInfo: vi.fn().mockResolvedValue(null),
    },
    // Runs the callback right away and hands it the fake tx, like drizzle would
    drizzle: {db: {transaction: vi.fn((callback: (tx: unknown) => unknown) => callback(TX))}},
    coreClient: {emit: vi.fn()},
  };
}

type Mocks = ReturnType<typeof createMocks>;

async function buildService(mocks: Mocks): Promise<AuthService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AuthService,
      {provide: PinoLogger, useValue: mocks.logger},
      {provide: TokenUtil, useValue: mocks.tokenUtil},
      {provide: ConfigService, useValue: mocks.config},
      {provide: DrizzleService, useValue: mocks.drizzle},
      {provide: AuthMailService, useValue: mocks.authMail},
      {provide: UsersCacheService, useValue: mocks.usersCache},
      {provide: CORE_SERVICE_NAME, useValue: mocks.coreClient},
      {provide: AuthRepository, useValue: mocks.authRepository},
      {provide: UsersRepository, useValue: mocks.usersRepository},
    ],
  }).compile();

  return moduleRef.get(AuthService);
}

/** Awaits a rejecting call and hands back the payload of the AppException it threw */
async function appErrorOf(promise: Promise<unknown>): Promise<AppErrorPayload> {
  const error = await promise.then(
    () => {
      throw new Error("Expected the call to reject, but it resolved");
    },
    (e: unknown) => e,
  );

  expect(error).toBeInstanceOf(AppException);
  return (error as AppException).getError() as AppErrorPayload;
}

describe("AuthService", () => {
  let mocks: Mocks;
  let service: AuthService;
  let passwordHash: string;

  // The full row, password hash included, which is what the repository returns for password checks
  const storedUser = (overrides: Partial<User> = {}): User => ({
    ...safeUser,
    password: passwordHash,
    ...overrides,
  });

  beforeAll(async () => {
    // Low cost on purpose, we only need a valid hash and the tests should stay fast
    passwordHash = await hash(PASSWORD, 4);
  });

  beforeEach(async () => {
    mocks = createMocks();
    service = await buildService(mocks);
  });

  // =========================
  // |       Register        |
  // =========================
  describe("register", () => {
    const input: RegisterUserSchemaType = {
      email: "dpk@example.com",
      display_name: "dpk",
      password: PASSWORD,
    };

    beforeEach(() => {
      mocks.usersRepository.insertUser.mockResolvedValue([safeUser]);
    });

    it("saves a bcrypt hash and never the plain password", async () => {
      await service.register(input, clientInfo);

      const [saved] = mocks.usersRepository.insertUser.mock.calls[0] as User[];

      expect(saved.password).not.toBe(PASSWORD);
      expect(await compare(PASSWORD, saved.password)).toBe(true);
      expect(saved.email).toBe(input.email);
    });

    it("returns the created user", async () => {
      await expect(service.register(input, clientInfo)).resolves.toBe(safeUser);
    });

    it("emits user.registered with the new user id, so core can create the wallet", async () => {
      await service.register(input, clientInfo);

      expect(mocks.coreClient.emit).toHaveBeenCalledTimes(1);
      expect(mocks.coreClient.emit).toHaveBeenCalledWith(AUTH_EVENTS.USER_REGISTERED, safeUser.id);
    });

    it("sends the welcome email", async () => {
      await service.register(input, clientInfo);

      expect(mocks.authMail.authNotification).toHaveBeenCalledWith(
        "register",
        input.email,
        expect.any(String),
        clientInfo,
      );
    });

    it("invalidates the cached users list", async () => {
      await service.register(input, clientInfo);

      expect(mocks.usersCache.incrementUserListVersion).toHaveBeenCalledTimes(1);
    });

    it("answers 409 for a duplicate email and triggers no side effects", async () => {
      // Postgres unique violation, wrapped under `cause` the way Drizzle does it
      const duplicate = Object.assign(new Error("insert failed"), {cause: {code: "23505"}});
      mocks.usersRepository.insertUser.mockRejectedValue(duplicate);

      const error = await appErrorOf(service.register(input, clientInfo));

      expect(error).toMatchObject({statusCode: 409, code: "CONFLICT"});
      expect(mocks.coreClient.emit).not.toHaveBeenCalled();
      expect(mocks.authMail.authNotification).not.toHaveBeenCalled();
      expect(mocks.usersCache.incrementUserListVersion).not.toHaveBeenCalled();
    });
  });

  // =========================
  // |       Login           |
  // =========================
  describe("login", () => {
    const input: LoginUserSchemaType = {
      email: "dpk@example.com",
      password: PASSWORD,
      remember: false,
    };

    // The full row, password hash included, which is what the repository returns for login
    const storedUser = (overrides: Partial<User> = {}): User => ({
      ...safeUser,
      password: passwordHash,
      ...overrides,
    });

    beforeEach(() => {
      mocks.usersRepository.findOne.mockImplementation(() => storedUser());
    });

    it("returns tokens, cookie options and the user without the password", async () => {
      const result = await service.login(input, clientInfo);

      expect(result).toEqual({
        accessToken: TOKENS.accessToken,
        refreshToken: TOKENS.refreshToken,
        accessOptions: ACCESS_COOKIE,
        refreshOptions: REFRESH_COOKIE,
        user: safeUser,
      });
      expect(result.user).not.toHaveProperty("password");
    });

    it("looks the user up by the given identifier and asks for the full row", async () => {
      await service.login(input, clientInfo);

      expect(mocks.usersRepository.findOne).toHaveBeenCalledWith(
        {email: input.email, username: undefined},
        false,
      );
    });

    it("stores only the hash of the refresh token in the session", async () => {
      await service.login(input, clientInfo);

      expect(mocks.authRepository.insertRefreshToken).toHaveBeenCalledWith({
        expires_in: TOKENS.expires_in,
        user_id: safeUser.id,
        client_info: clientInfo,
        replace_by_token_id: null,
        token_hash: TOKENS.hashedRefreshToken,
        remember_me: false,
      });
    });

    it("passes the remember-me choice through to tokens, cookies and the session", async () => {
      await service.login({...input, remember: true}, clientInfo);

      expect(mocks.tokenUtil.getAccessAndRefreshTokens).toHaveBeenCalledWith(
        expect.objectContaining({sub: safeUser.id, role: safeUser.role}),
        true,
      );
      expect(mocks.tokenUtil.getCookieOptions).toHaveBeenCalledWith("refresh", true);
      expect(mocks.authRepository.insertRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({remember_me: true}),
      );
    });

    it("caches the safe user and sends a login alert", async () => {
      await service.login(input, clientInfo);

      expect(mocks.usersCache.setCacheUserInfo).toHaveBeenCalledWith(safeUser);
      expect(mocks.authMail.authNotification).toHaveBeenCalledWith(
        "login",
        safeUser.email,
        expect.any(String),
        clientInfo,
      );
    });

    it("rejects an unknown user with 401 and issues nothing", async () => {
      mocks.usersRepository.findOne.mockResolvedValue(null);

      const error = await appErrorOf(service.login(input, clientInfo));

      expect(error).toMatchObject({statusCode: 401, code: "Invalid Credentials"});
      expect(mocks.tokenUtil.getAccessAndRefreshTokens).not.toHaveBeenCalled();
      expect(mocks.authRepository.insertRefreshToken).not.toHaveBeenCalled();
    });

    it("rejects a wrong password with the exact same error as an unknown user", async () => {
      // Same payload both ways, otherwise the endpoint leaks which emails are registered
      mocks.usersRepository.findOne.mockResolvedValueOnce(null);
      const unknownUser = await appErrorOf(service.login(input, clientInfo));

      const wrongPassword = await appErrorOf(
        service.login({...input, password: "not-the-password"}, clientInfo),
      );

      expect(wrongPassword).toEqual(unknownUser);
      expect(mocks.tokenUtil.getAccessAndRefreshTokens).not.toHaveBeenCalled();
      expect(mocks.authRepository.insertRefreshToken).not.toHaveBeenCalled();
    });

    // Fails until login checks `is_active`, see the fix in the notes
    it("does not log in a disabled account, even with the right password", async () => {
      mocks.usersRepository.findOne.mockImplementation(() => storedUser({is_active: false}));

      const error = await appErrorOf(service.login(input, clientInfo));

      expect(error).toMatchObject({statusCode: 403, code: "ACCOUNT_DISABLED"});
      expect(mocks.tokenUtil.getAccessAndRefreshTokens).not.toHaveBeenCalled();
      expect(mocks.authRepository.insertRefreshToken).not.toHaveBeenCalled();
    });
  });

  // =========================
  // |   Validate Refresh    |
  // =========================
  describe("validateRefresh", () => {
    const guard = {userId: safeUser.id, tokenHash: "hash-1"};

    describe("when the user is in the cache", () => {
      beforeEach(() => {
        mocks.usersCache.getCachedUserInfo.mockResolvedValue(safeUser);
        mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord()]);
      });

      it("returns the cached user together with the token record", async () => {
        const record = refreshRecord();
        mocks.authRepository.findRefreshRecord.mockResolvedValue([record]);

        const result = await service.validateRefresh(guard);

        expect(result).toEqual({user: safeUser, refreshRecord: record});
        expect(mocks.authRepository.findRefreshRecordWithUser).not.toHaveBeenCalled();
      });

      it("passes the transaction on to the token lookup", async () => {
        await service.validateRefresh(guard, TX as never);

        expect(mocks.authRepository.findRefreshRecord).toHaveBeenCalledWith("hash-1", TX);
      });

      it("rejects an unknown token with 401 REFRESH_TOKEN_EXPIRE", async () => {
        mocks.authRepository.findRefreshRecord.mockResolvedValue([]);

        const error = await appErrorOf(service.validateRefresh(guard));

        expect(error).toMatchObject({statusCode: 401, code: "REFRESH_TOKEN_EXPIRE"});
      });

      it("rejects a revoked token and tells the client to clear its cookies", async () => {
        mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord({is_revoked: true})]);

        const error = await appErrorOf(service.validateRefresh(guard));

        expect(error).toMatchObject({
          statusCode: 401,
          code: "REFRESH_TOKEN_REVOKED",
          meta: {clearAuthCookies: true},
        });
      });

      // Fails until validateRefresh looks at `expires_in`, see the notes
      it("rejects a token whose expiry date has passed", async () => {
        const expired = new Date(Date.now() - 1000);
        mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord({expires_in: expired})]);

        const error = await appErrorOf(service.validateRefresh(guard));

        expect(error).toMatchObject({statusCode: 401, code: "REFRESH_TOKEN_EXPIRE"});
      });
    });

    describe("when the cache is cold", () => {
      beforeEach(() => {
        mocks.usersCache.getCachedUserInfo.mockResolvedValue(null);
        mocks.authRepository.findRefreshRecordWithUser.mockResolvedValue([
          {...refreshRecord(), user: safeUser},
        ]);
      });

      it("loads token and user together, and returns them separated", async () => {
        const result = await service.validateRefresh(guard);

        expect(result).toEqual({user: safeUser, refreshRecord: refreshRecord({expires_in: expect.any(Date)})});
        expect(result.refreshRecord).not.toHaveProperty("user");
        expect(mocks.authRepository.findRefreshRecord).not.toHaveBeenCalled();
      });

      it("puts the user back into the cache for the next call", async () => {
        await service.validateRefresh(guard);

        expect(mocks.usersCache.setCacheUserInfo).toHaveBeenCalledWith(safeUser);
      });

      it("passes the transaction on to the lookup", async () => {
        await service.validateRefresh(guard, TX as never);

        expect(mocks.authRepository.findRefreshRecordWithUser).toHaveBeenCalledWith("hash-1", TX);
      });

      it("rejects an unknown token with 401 REFRESH_TOKEN_EXPIRE", async () => {
        mocks.authRepository.findRefreshRecordWithUser.mockResolvedValue([]);

        const error = await appErrorOf(service.validateRefresh(guard));

        expect(error).toMatchObject({statusCode: 401, code: "REFRESH_TOKEN_EXPIRE"});
      });

      it("rejects a token whose user is gone with 401 USER_NOT_FOUND", async () => {
        mocks.authRepository.findRefreshRecordWithUser.mockResolvedValue([
          {...refreshRecord(), user: null},
        ]);

        const error = await appErrorOf(service.validateRefresh(guard));

        expect(error).toMatchObject({statusCode: 401, code: "USER_NOT_FOUND"});
        expect(mocks.usersCache.setCacheUserInfo).not.toHaveBeenCalled();
      });

      it("rejects a revoked token and tells the client to clear its cookies", async () => {
        mocks.authRepository.findRefreshRecordWithUser.mockResolvedValue([
          {...refreshRecord({is_revoked: true}), user: safeUser},
        ]);

        const error = await appErrorOf(service.validateRefresh(guard));

        expect(error).toMatchObject({
          statusCode: 401,
          code: "REFRESH_TOKEN_REVOKED",
          meta: {clearAuthCookies: true},
        });
      });
    });
  });

  // =========================
  // |       Refresh         |
  // =========================
  describe("refresh", () => {
    const request = {userId: safeUser.id, tokenHash: "hash-1", client_info: clientInfo};

    beforeEach(() => {
      mocks.usersCache.getCachedUserInfo.mockResolvedValue(safeUser);
      mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord()]);
      mocks.authRepository.rotateToken.mockResolvedValue({id: "rt-2"});
    });

    it("returns a fresh token pair, cookie options and the user", async () => {
      const result = await service.refresh(request);

      expect(result).toEqual({
        accessToken: TOKENS.accessToken,
        refreshToken: TOKENS.refreshToken,
        accessOptions: ACCESS_COOKIE,
        refreshOptions: REFRESH_COOKIE,
        user: safeUser,
      });
    });

    it("validates and rotates inside one transaction", async () => {
      await service.refresh(request);

      expect(mocks.drizzle.db.transaction).toHaveBeenCalledWith(expect.any(Function), {
        accessMode: "read write",
        isolationLevel: "read committed",
      });
      expect(mocks.authRepository.findRefreshRecord).toHaveBeenCalledWith("hash-1", TX);
      expect(mocks.authRepository.rotateToken).toHaveBeenCalledWith(
        "rt-1",
        {
          expires_in: TOKENS.expires_in,
          client_info: clientInfo,
          remember_me: false,
          user_id: safeUser.id,
          replace_by_token_id: null,
          token_hash: TOKENS.hashedRefreshToken,
        },
        TX,
      );
    });

    it("keeps the remember-me choice of the old session", async () => {
      mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord({remember_me: true})]);

      await service.refresh(request);

      expect(mocks.tokenUtil.getAccessAndRefreshTokens).toHaveBeenCalledWith(
        expect.objectContaining({sub: safeUser.id, role: safeUser.role}),
        true,
      );
      expect(mocks.tokenUtil.getCookieOptions).toHaveBeenCalledWith("refresh", true);
    });

    it("uses a new jti for every access token", async () => {
      await service.refresh(request);
      await service.refresh(request);

      const jtis = mocks.tokenUtil.getAccessAndRefreshTokens.mock.calls.map(([payload]) => (payload as AccessTokenPayload).jti);

      expect(jtis).toHaveLength(2);
      expect(new Set(jtis).size).toBe(2);
    });

    it("rejects an unknown token without revoking the user's other sessions", async () => {
      mocks.authRepository.findRefreshRecord.mockResolvedValue([]);

      const error = await appErrorOf(service.refresh(request));

      expect(error).toMatchObject({statusCode: 401, code: "REFRESH_TOKEN_EXPIRE"});
      expect(mocks.authRepository.rotateToken).not.toHaveBeenCalled();
      expect(mocks.authRepository.revokeAllUserTokens).not.toHaveBeenCalled();
    });

    it("revokes every session when an already revoked token shows up again", async () => {
      mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord({is_revoked: true})]);

      const error = await appErrorOf(service.refresh(request));

      expect(error).toMatchObject({code: "REFRESH_TOKEN_REVOKED", meta: {clearAuthCookies: true}});
      expect(mocks.authRepository.rotateToken).not.toHaveBeenCalled();
      // Called without a tx on purpose: the transaction above has already rolled back
      expect(mocks.authRepository.revokeAllUserTokens).toHaveBeenCalledWith(safeUser.id);
      expect(mocks.tokenUtil.getCookieOptions).not.toHaveBeenCalled();
    });

    it("revokes every session when the repository detects token reuse", async () => {
      mocks.authRepository.rotateToken.mockRejectedValue(
        new AppException({
          statusCode: 401,
          code: "REFRESH_TOKEN_REUSE",
          message: "Refresh token reuse detected.",
          meta: {clearAuthCookies: true},
        }),
      );

      const error = await appErrorOf(service.refresh(request));

      expect(error).toMatchObject({code: "REFRESH_TOKEN_REUSE"});
      expect(mocks.authRepository.revokeAllUserTokens).toHaveBeenCalledWith(safeUser.id);
      expect(mocks.tokenUtil.getCookieOptions).not.toHaveBeenCalled();
    });

    it("still throws the original error when revoking all sessions fails too", async () => {
      mocks.authRepository.findRefreshRecord.mockResolvedValue([refreshRecord({is_revoked: true})]);
      mocks.authRepository.revokeAllUserTokens.mockRejectedValue(new Error("db is down"));

      const error = await appErrorOf(service.refresh(request));

      expect(error).toMatchObject({code: "REFRESH_TOKEN_REVOKED"});
      expect(mocks.logger.error).toHaveBeenCalledTimes(1);
    });
  });

  // =========================
  // |        Logout         |
  // =========================
  describe("logout", () => {
    it("revokes the session by the sha256 hash of the raw token", () => {
      service.logout("raw-refresh-token");

      const expected = createHash("sha256").update("raw-refresh-token").digest("hex");
      expect(mocks.authRepository.revokeToken).toHaveBeenCalledWith(expected);
    });

    it("does nothing when there is no token, like when the cookie is already gone", () => {
      service.logout(null);

      expect(mocks.authRepository.revokeToken).not.toHaveBeenCalled();
    });
  });

  // =========================
  // |    Change Password    |
  // =========================
  describe("changePassword", () => {
    const NEW_PASSWORD = "An0ther!Passw0rd";
    const request = {
      userId: safeUser.id,
      oldPassword: PASSWORD,
      newPassword: NEW_PASSWORD,
      clientInfo,
    };

    beforeEach(() => {
      mocks.usersRepository.findOne.mockImplementation(() => storedUser());
    });

    it("stores the new password hashed and revokes every session, in one transaction", async () => {
      await service.changePassword(request);

      expect(mocks.usersRepository.findOne).toHaveBeenCalledWith({id: safeUser.id}, false, TX);

      const [params, tx] = mocks.authRepository.changePassword.mock.calls[0] as [
        { id: string; password: string },
        { tag: string; }
      ];
      expect(params.id).toBe(safeUser.id);
      expect(params.password).not.toBe(NEW_PASSWORD);
      expect(await compare(NEW_PASSWORD, params.password)).toBe(true);
      expect(tx).toBe(TX);

      expect(mocks.authRepository.revokeAllUserTokens).toHaveBeenCalledWith(safeUser.id, TX);
    });

    it("returns a message that asks the user to log in again", async () => {
      await expect(service.changePassword(request)).resolves.toMatch(/password changed successfully/i);
    });

    it("sends the alert email, and only after the transaction has committed", async () => {
      let committed = false;
      let committedWhenMailWasSent: boolean | undefined;

      mocks.drizzle.db.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => {
        const result = await callback(TX);
        committed = true;
        return result;
      });
      mocks.authMail.passwordChangedNotification.mockImplementation(() => {
        committedWhenMailWasSent = committed;
        return Promise.resolve();
      });

      await service.changePassword(request);

      expect(mocks.authMail.passwordChangedNotification).toHaveBeenCalledWith(safeUser.email, clientInfo, "change");
      expect(committedWhenMailWasSent).toBe(true);
    });

    it("rejects a wrong current password with 400 and changes nothing", async () => {
      const error = await appErrorOf(service.changePassword({...request, oldPassword: "not-my-password"}));

      expect(error).toMatchObject({statusCode: 400, code: "Invalid Old Password"});
      expect(mocks.authRepository.changePassword).not.toHaveBeenCalled();
      expect(mocks.authRepository.revokeAllUserTokens).not.toHaveBeenCalled();
      expect(mocks.authMail.passwordChangedNotification).not.toHaveBeenCalled();
    });

    it("answers 404 when the user does not exist", async () => {
      mocks.usersRepository.findOne.mockResolvedValue(null);

      const error = await appErrorOf(service.changePassword(request));

      expect(error).toMatchObject({statusCode: 404, code: "NOT_FOUND"});
      expect(mocks.authRepository.changePassword).not.toHaveBeenCalled();
    });

    it("sends no email when the transaction fails", async () => {
      mocks.authRepository.revokeAllUserTokens.mockRejectedValue(new Error("boom"));

      await expect(service.changePassword(request)).rejects.toThrow("boom");

      expect(mocks.authMail.passwordChangedNotification).not.toHaveBeenCalled();
    });
  });

  // =========================
  // |    Forgot Password    |
  // =========================
  describe("forgotPassword", () => {
    it("returns an appropriate message when no active account exists", async () => {
      mocks.usersRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword(
        "nobody@example.com",
        clientInfo,
      );

      expect(result).toBe(
        "No active account was found with this email address. Please check your email or contact support if you believe this is a mistake.",
      );

      expect(mocks.tokenUtil.setPwdToken).not.toHaveBeenCalled();
      expect(mocks.authMail.forgotPasswordNotification).not.toHaveBeenCalled();
    });

    it("returns an appropriate message when the account is inactive", async () => {
      mocks.usersRepository.findOne.mockResolvedValue({
        ...safeUser,
        is_active: false,
      });

      const result = await service.forgotPassword(
        safeUser.email,
        clientInfo,
      );

      expect(result).toBe(
        "No active account was found with this email address. Please check your email or contact support if you believe this is a mistake.",
      );

      expect(mocks.tokenUtil.setPwdToken).not.toHaveBeenCalled();
      expect(mocks.authMail.forgotPasswordNotification).not.toHaveBeenCalled();
    });

    it("issues a token and mails the reset link to an active account", async () => {
      mocks.usersRepository.findOne.mockResolvedValue(safeUser);
      mocks.tokenUtil.setPwdToken.mockResolvedValue("raw-reset-token");

      const result = await service.forgotPassword(
        safeUser.email,
        clientInfo,
      );

      expect(result).toBe(
        "Password reset instructions have been sent to your email address. Please check your inbox.",
      );

      expect(mocks.usersRepository.findOne).toHaveBeenCalledWith({
        email: safeUser.email,
      });

      expect(mocks.tokenUtil.setPwdToken).toHaveBeenCalledWith({
        email: safeUser.email,
        id: safeUser.id,
      });

      expect(mocks.authMail.forgotPasswordNotification).toHaveBeenCalledWith(
        safeUser.email,
        "raw-reset-token",
        clientInfo,
        15,
      );
    });

    it("does not send another email while an earlier reset link is still valid", async () => {
      mocks.usersRepository.findOne.mockResolvedValue(safeUser);
      mocks.tokenUtil.setPwdToken.mockResolvedValue(null);

      const result = await service.forgotPassword(
        safeUser.email,
        clientInfo,
      );

      expect(result).toBe(
        "Password reset instructions have been sent to your email address. Please check your inbox.",
      );

      expect(mocks.tokenUtil.setPwdToken).toHaveBeenCalled();
      expect(mocks.authMail.forgotPasswordNotification).not.toHaveBeenCalled();
    });
  });

  // =========================
  // |     reset Password    |
  // =========================
  describe("resetPassword", () => {
    const NEW_PASSWORD = "Br4nd-new!Passw0rd";
    const request = {token: "raw-reset-token", newPassword: NEW_PASSWORD, clientInfo};
    const resetPayload = {id: safeUser.id, email: safeUser.email};

    beforeEach(() => {
      mocks.tokenUtil.verifyPwdToken.mockResolvedValue(resetPayload);
    });

    it("rejects an invalid, expired or used token with 400 and touches nothing", async () => {
      mocks.tokenUtil.verifyPwdToken.mockResolvedValue(null);

      const error = await appErrorOf(service.resetPassword(request));

      expect(error).toMatchObject({statusCode: 400, code: "INVALID_RESET_TOKEN"});
      expect(mocks.drizzle.db.transaction).not.toHaveBeenCalled();
      expect(mocks.authMail.passwordChangedNotification).not.toHaveBeenCalled();
    });

    it("hands the raw token to verifyPwdToken", async () => {
      await service.resetPassword(request);

      expect(mocks.tokenUtil.verifyPwdToken).toHaveBeenCalledWith("raw-reset-token");
    });

    it("stores the new password hashed and revokes every session, in one transaction", async () => {
      await service.resetPassword(request);

      const [params, tx] = mocks.authRepository.changePassword.mock.calls[0] as [
        { id: string; password: string },
        { tag: string; }
      ];
      expect(params.password).not.toBe(NEW_PASSWORD);
      expect(params.id).toBe(safeUser.id);
      expect(await compare(NEW_PASSWORD, params.password)).toBe(true);
      expect(tx).toBe(TX);

      expect(mocks.authRepository.revokeAllUserTokens).toHaveBeenCalledWith(safeUser.id, TX);
    });

    it("sends the alert email and returns a success message", async () => {
      await expect(service.resetPassword(request)).resolves.toMatch(/reset successfully/i);

      expect(mocks.authMail.passwordChangedNotification).toHaveBeenCalledWith(safeUser.email, clientInfo, "reset");
    });

    it("maps a database foreign-key error to 404 and sends no email", async () => {
      const missingUser = Object.assign(new Error("insert failed"), {cause: {code: "23503"}});
      mocks.authRepository.changePassword.mockRejectedValue(missingUser);

      const error = await appErrorOf(service.resetPassword(request));

      expect(error).toMatchObject({statusCode: 404, code: "NOT_FOUND"});
      expect(mocks.authMail.passwordChangedNotification).not.toHaveBeenCalled();
    });

    it("lets unknown errors through untouched", async () => {
      mocks.authRepository.changePassword.mockRejectedValue(new Error("boom"));

      await expect(service.resetPassword(request)).rejects.toThrow("boom");
      expect(mocks.authMail.passwordChangedNotification).not.toHaveBeenCalled();
    });
  });
});
