import {Field, ObjectType} from "@nestjs/graphql";
import {UserRoleEnum} from "@live-bid/contracts/enums";

@ObjectType()
export class PublicProfileOutput {
  @Field(() => String)
  display_name: string;

  @Field(() => String, {nullable: true})
  username: string | null;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Field(() => Boolean)
  is_active: boolean;
}
