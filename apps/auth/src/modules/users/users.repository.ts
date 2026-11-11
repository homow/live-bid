import {eq, SQL} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import * as Schemas from "@live-bid/contracts/schemas";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {DrizzleService} from "@live-bid/services/modules";
import {type User, user} from "@live-bid/services/database";
import {AppException, handleDrizzleError} from "@live-bid/services/lib";
import type {DrizzleTransaction, SafeUser} from "@live-bid/services/types";

export const USER_PUBLIC_COLUMNS = {
  id: user.id,
  role: user.role,
  email: user.email,
  username: user.username,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
  display_name: user.display_name,
};

interface FindOneUserParams {
  id?: string;
  email?: string;
  username?: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async insertUser({password, email, display_name}: Schemas.RegisterUserSchemaType, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    const {username: _, ...othersData} = USER_PUBLIC_COLUMNS;

    return await db
      .insert(user)
      .values({
        email,
        password,
        display_name,
        is_active: true,
        role: UserRoleEnum.USER,
      })
      .returning(othersData);
  }

  /**
   * **Overload 1: When safe is true, returns SafeUser (without password)**
   */
  async findOne(
    params: FindOneUserParams,
    safe?: true,
    tx?: DrizzleTransaction
  ): Promise<SafeUser | null>;

  /**
   * **Overload 2: When safe is false, returns full User (with password)**
   */
  // noinspection JSUnusedGlobalSymbols
  async findOne(
    params: FindOneUserParams,
    safe?: false,
    tx?: DrizzleTransaction
  ): Promise<User | null>;

  async findOne(
    {
      id,
      email,
      username,
    }: FindOneUserParams,
    safe: boolean = true,
    tx?: DrizzleTransaction,
  ): Promise<SafeUser | User | null> {
    let eqUser: SQL<unknown>;

    if (id) {
      eqUser = eq(user.id, id);
    } else if (email) {
      eqUser = eq(user.email, email);
    } else if (username) {
      eqUser = eq(user.username, username);
    } else {
      throw new AppException({
        statusCode: 500,
        code: 'Missing identifier',
        message: `Either 'phone' or 'id' must be provided to find the user. in ${UsersRepository.name}`,
      });
    }

    const [findUser] = await this.buildUserQuery(eqUser, tx);

    if (!findUser) return null;

    if (safe) {
      const {password, ...data} = findUser;
      void password;
      return data satisfies SafeUser;
    }

    return findUser satisfies User;
  }

  buildUserQuery(whereCondition?: SQL<unknown>, tx?: DrizzleTransaction) {
    const db = tx ?? this.drizzle.db;

    const query = db
      .select()
      .from(user)
      .groupBy(user.id);

    if (whereCondition) {
      return query.where(whereCondition);
    }

    return query;
  }
}
