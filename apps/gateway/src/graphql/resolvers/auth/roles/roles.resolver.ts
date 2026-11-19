import * as Inputs from "./inputs";
import {firstValueFrom} from "rxjs";
import * as Outputs from "./outputs";
import {Inject} from "@nestjs/common";
import * as Decorators from "./decorators";
import {ClientProxy} from "@nestjs/microservices";
import {ZodPipe} from "@app/gateway/common/pipes";
import {Args, Mutation, Resolver} from "@nestjs/graphql";
import {CurrentUser} from "@app/gateway/common/decorators";
import {ROLES_MESSAGES} from "@live-bid/services/messages";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {ModifyRoleSchema, type ModifyRoleSchemaType} from "@live-bid/contracts/schemas";
import type {ModifyRoleRequestService, ModifyRoleResponseService, UserAccess} from "@live-bid/services/types";

/**
 * RolesResolver
 *
 * GraphQL resolver responsible for exposing role-management operations
 * through the public API.
 *
 * Delegates role modification requests to the Auth microservice using
 * NestJS ClientProxy and validates incoming arguments against shared
 * Zod contracts.
 *
 * @remarks
 * - **Validation:** Uses ZodPipe with ModifyRoleSchema.
 * - **Authentication:** Retrieves the authenticated actor through CurrentUser.
 * - **Authorization:** Applies role-management guards and decorators.
 * - **Communication:** Delegates business logic to the Auth microservice.
 * - **Type Safety:** Uses shared request and response types from @live-bid/services.
 *
 * @example
 * ```graphql
 * mutation {
 *   modifyRole(input: {
 *     userId: "user-uuid"
 *     newRole: ADMIN
 *   }) {
 *     userId
 *     newRole
 *     result
 *   }
 * }
 * ```
 */
@Resolver()
export class RolesResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  /**
   * Modifies the role assigned to a target user.
   *
   * Validates the GraphQL input, retrieves the authenticated actor,
   * and delegates the operation to the Auth microservice.
   *
   * @param input - Validated role modification payload containing the target user ID and new role.
   * @param actor - Authenticated user performing the operation.
   *
   * @returns A Promise resolving to the role modification result.
   *
   * @throws AppException - Propagated from the Auth microservice when validation,
   * authorization, or business rules are violated.
   *
   * @throws Error - If communication with the Auth microservice fails.
   *
   * @remarks
   * The resolver does not contain role-management business logic.
   * All policy enforcement and database operations are handled by the
   * Auth microservice.
   */
  @Decorators.GetModifyRoleDecorators()
  @Mutation(() => Outputs.ModifyRoleOutput)
  modifyRole(
    @Args(
      'input',
      {type: () => Inputs.ModifyRoleInput},
      new ZodPipe(ModifyRoleSchema)
    ) input: ModifyRoleSchemaType,
    @CurrentUser() actor: UserAccess,
  ) {
    return firstValueFrom<ModifyRoleResponseService>(
      this.authClient.send(
        ROLES_MESSAGES.MODIFY_ROLE,
        {
          target: {
            id: input.userId,
            newRole: input.newRole,
          },
          actor: {
            id: actor.userId,
            role: actor.role,
          }
        } satisfies ModifyRoleRequestService
      )
    );
  }
}
