import {Field} from "@nestjs/graphql";
import {UserRoleEnum} from "@live-bid/contracts/enums";

export class PublicProfileOutput {
  @Field(() => String)
  display_name: string;

  @Field(() => String)
  username: string;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Field(() => Boolean)
  is_active: boolean;
}
