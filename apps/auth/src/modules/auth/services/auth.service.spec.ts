import {hash, compare} from "bcrypt";
import {Test} from "@nestjs/testing";
import {PinoLogger} from "nestjs-pino";
import {ConfigService} from "@nestjs/config";
import {beforeAll, beforeEach, describe, expect, it, vi} from "vitest";

import {TokenUtil} from "../utils";
import {AuthService} from "./auth.service";
import {AuthRepository} from "../auth.repository";
import {AuthMailService} from "./auth-mail.service";
import type {User} from "@live-bid/services/database";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {AUTH_EVENTS} from "@live-bid/services/events";
import {DrizzleService} from "@live-bid/services/modules";
import {CORE_SERVICE_NAME} from "@live-bid/services/names";
import {UsersCacheService} from "@app/auth/modules/users/services";
import {UsersRepository} from "@app/auth/modules/users/users.repository";
import {AppException, type AppErrorPayload} from "@live-bid/services/lib";
import type {NormalizeClientInfoType, SafeUser} from "@live-bid/services/types";
import type {LoginUserSchemaType, RegisterUserSchemaType} from "@live-bid/contracts/schemas";

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

function createMocks() {
  return {
    logger: {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()},
    config: {get: vi.fn()},
    tokenUtil: {
      getAccessAndRefreshTokens: vi.fn().mockReturnValue(TOKENS),
      getCookieOptions: vi.fn((type: string) => (type === "access" ? ACCESS_COOKIE : REFRESH_COOKIE)),
    },
    authMail: {authNotification: vi.fn().mockResolvedValue(undefined)},
    authRepository: {insertRefreshToken: vi.fn().mockResolvedValue(undefined)},
    usersRepository: {insertUser: vi.fn(), findOne: vi.fn()},
    usersCache: {incrementUserListVersion: vi.fn(), setCacheUserInfo: vi.fn()},
    coreClient: {emit: vi.fn()},
  };
}

type Mocks = ReturnType<typeof createMocks>;

async function buildService(mocks: Mocks): Promise<AuthService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AuthService,
      {provide: PinoLogger, useValue: mocks.logger},
      {provide: ConfigService, useValue: mocks.config},
      {provide: TokenUtil, useValue: mocks.tokenUtil},
      {provide: AuthMailService, useValue: mocks.authMail},
      {provide: AuthRepository, useValue: mocks.authRepository},
      {provide: UsersRepository, useValue: mocks.usersRepository},
      {provide: UsersCacheService, useValue: mocks.usersCache},
      {provide: CORE_SERVICE_NAME, useValue: mocks.coreClient},
      // AuthService only holds on to this one, none of the tested paths touch it
      {provide: DrizzleService, useValue: {}},
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
});
