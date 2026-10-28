import {ObjectType} from "@nestjs/graphql";
import {LoginUserOutput} from "@app/gateway/graphql/resolvers/auth/auth/outputs";

@ObjectType()
export class GetProfileOutput extends LoginUserOutput {}
