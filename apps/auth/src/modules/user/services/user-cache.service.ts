import {Injectable} from "@nestjs/common";
import {CacheService} from "@live-bid/services/cache/cache.service";

@Injectable()
export class UserCacheService {
  constructor(
    private readonly cache: CacheService,
  ) {}
}
