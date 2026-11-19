import {Field, ID, InputType} from "@nestjs/graphql";
import {UserRoleEnum} from "@app/gateway/common/enums";

@InputType()
export class ModifyRoleInput {
  @Field(() => ID)
  userId: string;

  @Field(() => UserRoleEnum)
  newRole: UserRoleEnum;
}
