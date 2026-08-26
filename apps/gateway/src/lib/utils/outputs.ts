import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType({isAbstract: true})
export abstract class BaseOutput {
  @Field(() => String)
  id: string;

  @Field(() => String, {nullable: true})
  created_at: string | null;

  @Field(() => String, {nullable: true})
  updated_at: string | null;
}
