import {Field, ObjectType} from "@nestjs/graphql";
import {BaseOutput} from "@app/gateway/common/outputs";
import {UserRoleEnum} from "@app/gateway/common/enums";

@ObjectType()
export class RegisterUserOutput extends BaseOutput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  display_name: string;

  @Field(() => UserRoleEnum)
  role: UserRoleEnum;

  @Field(() => Boolean)
  is_active: boolean;
}
