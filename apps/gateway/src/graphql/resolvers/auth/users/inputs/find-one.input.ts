import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class FindOneInput {
  @Field(() => String, {nullable: true})
  username?: string;

  @Field(() => String, {nullable: true})
  email?: string;

  @Field(() => String, {nullable: true})
  user_id?: string;
}
