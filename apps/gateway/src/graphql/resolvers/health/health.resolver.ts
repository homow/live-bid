import {Public} from "@app/gateway/common";
import {HealthCheckOutput} from './outputs';
import {Query, Resolver} from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Public()
  @Query(() => String)
  health(): string {
    return 'OK';
  }

  @Public()
  @Query(() => HealthCheckOutput)
  healthCheck(): HealthCheckOutput {
    return {
      status: 'ok',
      message: 'Service is up and running smoothly.',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
