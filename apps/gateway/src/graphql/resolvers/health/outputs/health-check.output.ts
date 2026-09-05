import {Field, Float, ObjectType} from '@nestjs/graphql';

@ObjectType()
export class HealthCheckOutput {
  @Field(() => String)
  status: string;

  @Field(() => String)
  message: string;

  @Field(() => String)
  timestamp: string;

  @Field(() => Float)
  uptime: number;
}
