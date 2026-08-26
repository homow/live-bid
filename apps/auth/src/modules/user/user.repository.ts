import {eq, SQL} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import * as Schemas from "@live-bid/contracts/schemas";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import type {SafeUser} from "@live-bid/services/types";
import {DrizzleService} from "@live-bid/services/database";
import {type User, user} from "@live-bid/services/database";
import {AppException, checkDrizzleError} from "@live-bid/services/lib";

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
export class UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async insertUser({password, email, display_name}: Schemas.RegisterUserSchemaType) {
    const {username, ...othersData} = USER_PUBLIC_COLUMNS;
    void username;

    try {
      const [result] = await this.drizzle.db
        .insert(user)
        .values({
          email,
          password,
          display_name,
          is_active: true,
          role: UserRoleEnum.USER,
        })
        .returning(othersData);

      return result;
    } catch (e) {
      checkDrizzleError({
        e,
        mainResource: 'user',
        conflictField: 'email',
      });
    }
  }

  /**
   * **Overload 1: When safe is true, returns SafeUser (without password)**
   */
  // noinspection JSUnusedGlobalSymbols
  async findOne(
    params: FindOneUserParams,
    safe?: true
  ): Promise<User | null>;

  /**
   * **Overload 2: When safe is false, returns full User (with password)**
   */
  async findOne(
    params: FindOneUserParams,
    safe?: false
  ): Promise<User | null>;

  async findOne({email, username, id}: FindOneUserParams, safe: boolean = true): Promise<SafeUser | User | null> {
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
        message: `Either 'phone' or 'id' must be provided to find the user. in ${UserRepository.name}`,
      });
    }

    const [findUser] = await this.buildUserQuery(eqUser);

    if (!findUser) return null;

    if (safe) {
      const {password, ...data} = findUser;
      void password;
      return data satisfies SafeUser;
    }

    return findUser satisfies User;
  }

  buildUserQuery(whereCondition?: SQL<unknown>) {
    const query = this.drizzle.db
      .select()
      .from(user)
      .groupBy(user.id);

    if (whereCondition) {
      return query.where(whereCondition);
    }

    return query;
  }
}
