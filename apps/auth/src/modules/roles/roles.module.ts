import {Module} from "@nestjs/common";
import {UsersModule} from "@app/auth/modules";
import {RolesService, RolesPolicy} from "./services";

@Module({
  imports: [UsersModule],
  providers: [
    RolesPolicy,
    RolesService,
  ],
})
export class RolesModule {}
