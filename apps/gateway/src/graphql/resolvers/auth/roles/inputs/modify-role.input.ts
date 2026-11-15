import {Field, ID, InputType} from "@nestjs/graphql";
import {UserRoleEnum} from "@app/gateway/graphql/resolvers/auth/enums";

@InputType()
export class ModifyRoleInput {
  @Field(() => ID)
  userId: string;

  @Field(() => UserRoleEnum)
  newRole: UserRoleEnum;
}
