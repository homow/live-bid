import {Injectable} from "@nestjs/common";
import {user} from "@live-bid/services/database";
import {DrizzleService} from "@live-bid/services/database";
import {checkDrizzleError, UserRoleEnum} from "@live-bid/services/lib";
import {type RegisterUserSchemaType} from "@live-bid/contracts/schemas";

@Injectable()
export class UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createUser({password, email, display_name}: RegisterUserSchemaType) {
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
        .returning();

      return result;
    } catch (e) {
      checkDrizzleError({
        e,
        mainResource: 'user',
        conflictField: 'email or username',
      });
    }
  }
}
