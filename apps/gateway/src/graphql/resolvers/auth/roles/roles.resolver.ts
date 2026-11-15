import * as Inputs from "./inputs";
import * as Outputs from "./outputs";
import {Inject} from "@nestjs/common";
import {Args, Mutation, Resolver} from "@nestjs/graphql";
import * as Decorators from "./decorators";
import {ROLES_MESSAGES} from "@live-bid/services/messages";
import {ModifyRoleSchema, type ModifyRoleSchemaType} from "@live-bid/contracts/schemas";
import {ClientProxy} from "@nestjs/microservices";
import type {ModifyRoleRequestService, ModifyRoleResponseService, UserAccess} from "@live-bid/services/types";
import {CurrentUser} from "@app/gateway/common/decorators";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {firstValueFrom} from "rxjs";
import {ZodPipe} from "@app/gateway/common/pipes";

@Resolver()
export class RolesResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

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
