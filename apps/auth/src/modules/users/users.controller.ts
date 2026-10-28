import {UsersService} from "./services";
import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import * as ServiceMessages from "@live-bid/services/messages";
import type {PublicProfileResponseService} from "@live-bid/services/types";

/**
 * **UsersController**
 *
 * Exposes user-related operations over the microservice transport layer.
 * This controller is the entry point for requests coming from the Gateway.
 *
 * @remarks
 * - Uses NestJS `@MessagePattern` (request/response) — not `@EventPattern` (fire-and-forget)
 * - Contains **no business logic**; delegates everything to `UsersService`
 * - Payloads are forwarded as-is; validation is expected at the Gateway edge
 */
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * **Get a user's public profile**
   *
   * Resolves the publicly visible profile of a user by ID.
   *
   * @param userId - Target user's UUIDv7 identifier
   * @returns PublicProfileResponseService - The mapped public profile
   *
   * @remarks
   * - Thin pass-through to `UsersService.getPublicProfile`
   * - Sensitive fields are stripped inside the service layer, not here
   * - If the user does not exist, the service throws an RPC error (surfaced as `NOT_FOUND`)
   */
  @MessagePattern(ServiceMessages.USERS_PATTERNS.PUBLIC_PROFILE)
  getPublicProfile(
    @Payload() userId: string
  ): Promise<PublicProfileResponseService> {
    return this.usersService.getPublicProfile(userId);
  }
}
