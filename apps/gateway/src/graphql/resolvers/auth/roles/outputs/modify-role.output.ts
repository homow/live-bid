import {Field, ID, ObjectType} from "@nestjs/graphql";
import {UserRoleEnum} from "@app/gateway/graphql/resolvers/auth/enums";

@ObjectType()
export class ModifyRoleOutput {
  @Field(() => UserRoleEnum)
  newRole: UserRoleEnum;

  @Field(() => ID)
  userId: string;

  @Field(() => String)
  result: string;
}
