import {Field, ObjectType} from "@nestjs/graphql";
import {RegisterUserOutput} from "./register.output";

@ObjectType()
export class LoginUserOutput extends RegisterUserOutput {
  @Field(() => String, {nullable: true})
  username?: string | null;
}
