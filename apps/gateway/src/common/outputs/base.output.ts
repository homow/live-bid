import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType({isAbstract: true})
export abstract class BaseOutput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  created_at: string;

  @Field(() => String)
  updated_at: string;
}
