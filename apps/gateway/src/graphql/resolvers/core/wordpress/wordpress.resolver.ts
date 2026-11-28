import {Inject} from "@nestjs/common";
import * as Decorators from './decorators';
import {Query, Resolver} from "@nestjs/graphql";
import {ClientProxy} from "@nestjs/microservices";
import {CORE_SERVICE_NAME} from "@live-bid/services/names";

@Resolver()
export class WordpressResolver {
  constructor(
    @Inject(CORE_SERVICE_NAME) private readonly coreClient: ClientProxy,
  ) {}

  @Decorators.GetPostDecorators()
  @Query(() => String)
  post() {
    return 'post';
  }
}
