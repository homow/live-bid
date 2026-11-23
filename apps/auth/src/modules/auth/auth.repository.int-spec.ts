import {randomBytes} from "node:crypto";
import {eq} from "drizzle-orm";
import {afterAll, beforeEach, describe, expect, it, vi} from "vitest";

import {AuthRepository} from "./auth.repository";
import {DrizzleService} from "@live-bid/services/modules";
import {refreshToken, user} from "@live-bid/services/database";
import {appErrorOf} from "../../../../../test/helpers/errors";
import {closeDb, createUser, resetDb} from "../../../../../test/helpers/db";

/**
 * AuthRepository against a real Postgres (the *_test database).
 * What matters here is the SQL itself: rotation, reuse detection, locking, rollbacks.
 */

const clientInfo = {
  ip: "203.0.113.7",
  browser: "Firefox",
  os: "Linux",
  device: "desktop",
  country: "US",
  city: "Chicago",
  lang: "en",
};

const logger = {setContext: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()};

const randomHash = () => randomBytes(32).toString("hex");
const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000);

describe("AuthRepository (real Postgres)", () => {});
