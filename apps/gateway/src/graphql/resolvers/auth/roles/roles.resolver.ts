import {Inject} from "@nestjs/common";
import {Resolver} from "@nestjs/graphql";
import * as Decorators from "./decorators";
import {ClientProxy} from "@nestjs/microservices";
import type {ModifyRoleRequestService, UserAccess} from "@live-bid/services/types";
import {CurrentUser} from "@app/gateway/common/decorators";
import {AUTH_SERVICE_NAME} from "@live-bid/services/names";
import {firstValueFrom} from "rxjs";
import * as ServiceMessages from "@live-bid/services/messages";

@Resolver()
export class RolesResolver {
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientProxy
  ) {}

  @Decorators.GetModifyRoleDecorators()
  modifyRole(
    @CurrentUser() actor: UserAccess,
  ) {
    return firstValueFrom(
      this.authClient.send(
        ServiceMessages.ROLES_MESSAGES.MODIFY_ROLE,
        {}
      )
    );
  }
}
