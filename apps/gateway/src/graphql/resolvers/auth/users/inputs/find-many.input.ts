import {Field, InputType} from "@nestjs/graphql";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {BasePaginationInputs} from "@app/gateway/common/inputs";

@InputType()
export class FindManyInput extends BasePaginationInputs {
  @Field(() => UserRoleEnum, {nullable: true})
  role?: UserRoleEnum;

  @Field(() => Boolean, {nullable: true})
  is_active?: boolean;
}
