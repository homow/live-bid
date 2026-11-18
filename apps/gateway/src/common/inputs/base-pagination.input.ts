import {Field, InputType} from "@nestjs/graphql";
import {BaseOrderByEnum, BaseSortByEnum} from "@app/gateway/common/enums";

@InputType({
  isAbstract: true
})
export class BasePaginationInputs {
  @Field(() => Number, {defaultValue: 2, nullable: true})
  limit?: number;

  @Field(() => Number, {defaultValue: 1, nullable: true})
  page?: number;

  @Field(() => BaseOrderByEnum, {defaultValue: BaseOrderByEnum.created_at, nullable: true})
  orderBy?: BaseOrderByEnum;

  @Field(() => BaseSortByEnum, {defaultValue: BaseSortByEnum.desc, nullable: true})
  sortBy?: BaseSortByEnum;
}
