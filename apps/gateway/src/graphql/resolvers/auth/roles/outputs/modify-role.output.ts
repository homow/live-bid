import {Field, ID, ObjectType} from "@nestjs/graphql";
import {UserRoleEnum} from "@app/gateway/common/enums";

@ObjectType()
export class ModifyRoleOutput {
  @Field(() => UserRoleEnum)
  newRole: UserRoleEnum;

  @Field(() => ID)
  userId: string;

  @Field(() => String)
  result: string;
}
