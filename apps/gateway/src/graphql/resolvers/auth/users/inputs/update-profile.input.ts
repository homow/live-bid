import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class UpdateProfileInput {
  @Field(() => String, {nullable: true})
  username?: string;

  @Field(() => String, {nullable: true})
  display_name?: string;
}
