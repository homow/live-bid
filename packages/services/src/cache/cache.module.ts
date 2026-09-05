import {CacheService} from "./cache.service";
import {Global, Module} from "@nestjs/common";

@Global()
@Module({
  exports: [CacheService],
  providers: [CacheService],
})
export class CacheModule {}
