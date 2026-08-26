import {Injectable} from "@nestjs/common";
import {UserRepository} from "../user.repository";
import type {SafeUser} from "@live-bid/services/types";
import {CacheService} from "@live-bid/services/cache/cache.service";
import {RedisKey} from "@live-bid/services/cache";
import {ONE_HOUR_MS, throwNotFoundEx} from "@live-bid/services/lib";
import {PinoLogger} from "nestjs-pino";

@Injectable()
export class UserCacheService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly cache: CacheService,
    private readonly userRepository: UserRepository,
  ) {}

  setCacheUserInfo(userResponse: SafeUser) {
    const key = RedisKey.build('user', ...RedisKey.getUserProfileKey(userResponse.id));
    void this.cache.set<SafeUser>(key, userResponse, ONE_HOUR_MS).catch(reason => {
      this.logger.error('Failed to cache user: ', reason);
    });
  }

  getCachedUserInfo(id: string) {
    const key = RedisKey.build('user', ...RedisKey.getUserProfileKey(id));
    return this.cache.get<SafeUser>(key);
  }

  async getOrSetUserCache(id: string) {
    const userCached = await this.getCachedUserInfo(id);
    if (userCached) return userCached;

    const findUser = await this.userRepository.findOne({id}, true);

    // Throw exception if user doesn't in database
    if (!findUser) throw throwNotFoundEx('User');

    this.setCacheUserInfo(findUser);

    return findUser;
  }
}
