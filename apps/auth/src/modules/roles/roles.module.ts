import {Module} from "@nestjs/common";
import {UsersModule} from "@app/auth/modules";
import {RolesService} from "./services/roles.service";

@Module({
  imports: [UsersModule],
  providers: [RolesService],
})
export class RolesModule {}
