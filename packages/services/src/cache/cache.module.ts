import {LoggerModule} from "nestjs-pino";
import {CacheService} from "./cache.service";
import {Global, Module} from "@nestjs/common";

@Global()
@Module({
  imports: [LoggerModule],
  exports: [CacheService],
  providers: [CacheService],
})
export class CacheModule {}
