import {Module} from "@nestjs/common";
import * as Services from "./services";
import {UsersModule} from "@app/auth/modules";
import {RolesController} from "./roles.controller";

@Module({
  imports: [
    UsersModule
  ],
  controllers: [
    RolesController
  ],
  providers: [
    Services.RolesPolicy,
    Services.RolesService,
  ],
})
export class RolesModule {}
