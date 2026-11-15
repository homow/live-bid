import {PinoLogger} from "nestjs-pino";
import {Injectable} from "@nestjs/common";
import {RolesPolicy} from "./roles-policy.service";
import {DrizzleService} from "@live-bid/services/modules";
import {UsersCacheService} from "@app/auth/modules/users/services";
import {AppException, throwNotFound} from "@live-bid/services/lib";
import {UsersRepository} from "@app/auth/modules/users/users.repository";
import type {ModifyRoleRequestService, ModifyRoleResponseService} from "@live-bid/services/types";

@Injectable()
export class RolesService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly drizzle: DrizzleService,
    private readonly rolesPolicy: RolesPolicy,
    private readonly usersRepository: UsersRepository,
    private readonly usersCacheService: UsersCacheService,
  ) {
    this.logger.setContext(RolesService.name);
  }

  async modifyRole({target, actor}: ModifyRoleRequestService): Promise<ModifyRoleResponseService> {
    // Check roles policy
    this.rolesPolicy.assertCanModifyRole({target, actor});

    const result = await this.drizzle.db.transaction(
      async (tx) => {
        // Find target user
        const targetUser = await this.usersRepository.findOne(
          {
            lock: true,
            id: target.id,
          },
          true,
          tx
        );

        // If user doesn't exist:
        if (!targetUser) throwNotFound('User', 'id');

        this.rolesPolicy.assertCanDemoteOwner({
          id: targetUser.id,
          role: targetUser.role,
        });

        // If user already has new role:
        if (targetUser.role === target.newRole) throw new AppException({
          statusCode: 409,
          code: 'ROLE_ALREADY_ASSIGNED',
          message: `User already has the role ${target.newRole}`,
        });

        await this.usersRepository.updateRole(target.id, target.newRole, tx);

        return {
          userId: target.id,
          newRole: target.newRole,
          result: 'Target user role updated successfully.',
        };
      },
      {
        accessMode: 'read write',
        isolationLevel: 'read committed',
      }
    );

    // Invalidate user cache
    await this.usersCacheService.deleteUserCache(target.id);
    return result;
  }
}
