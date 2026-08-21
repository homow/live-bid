import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class RegisterUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  display_name: string;
}
