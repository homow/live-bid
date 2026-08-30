import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class LoginUserInput {
  @Field(() => String, {nullable: true})
  email?: string;

  @Field(() => String, {nullable: true})
  username?: string;

  @Field(() => String)
  password: string;

  @Field(() => Boolean, {nullable: true, defaultValue: false})
  remember?: boolean;
}
