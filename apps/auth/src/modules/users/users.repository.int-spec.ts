import {afterAll, beforeEach, describe, expect, it} from "vitest";

import {UsersRepository} from "./users.repository";
import {user} from "@live-bid/services/database";
import {DrizzleService} from "@live-bid/services/modules";
import {BaseSortByEnum, UserRoleEnum} from "@live-bid/contracts/enums";
import type {FindManyUsersSchemaType} from "@live-bid/contracts/schemas";
import {appErrorOf, pgErrorCode} from "../../../../../test/helpers/errors";
import {closeDb, createUser, resetDb} from "../../../../../test/helpers/db";

/**
 * UsersRepository against a real Postgres (the *_test database).
 */

describe("UsersRepository (real Postgres)", () => {

});
