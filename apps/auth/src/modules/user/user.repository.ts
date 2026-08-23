import {eq, SQL} from "drizzle-orm";
import {Injectable} from "@nestjs/common";
import {user} from "@live-bid/services/database";
import * as Schemas from "@live-bid/contracts/schemas";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {checkDrizzleError} from "@live-bid/services/lib";
import {DrizzleService} from "@live-bid/services/database";

const USER_PUBLIC_COLUMNS = {
  id: user.id,
  role: user.role,
  email: user.email,
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

  async createUser({password, email, display_name}: Schemas.RegisterUserSchemaType) {
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
        .returning(USER_PUBLIC_COLUMNS);

      return result;
    } catch (e) {
      checkDrizzleError({
        e,
        mainResource: 'user',
        conflictField: 'email',
      });
    }
  }

  findOne({email, username, id}: FindOneUserParams, safe: boolean = true) {
    let eqUser: SQL<unknown>;

    if (id) {
      eqUser = eq(user.id, id);
    } else if (email) {
      eqUser = eq(user.email, email);
    } else if (username) {
      eqUser = eq(user.username, username);
    } else {

    }
  }
}
