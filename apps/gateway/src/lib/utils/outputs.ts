import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType({isAbstract: true})
export abstract class BaseOutput {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date)
  updated_at: Date;
}
