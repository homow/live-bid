import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class UpdateProfileOutput {
  @Field(() => String, {nullable: true})
  display_name?: string;

  @Field(() => String, {nullable: true})
  username?: string | null;
}
