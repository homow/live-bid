import {Reflector} from "@nestjs/core";
import {Observable, from, mergeMap} from "rxjs";
import {CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor} from "@nestjs/common";
import {CACHEABLE_KEY, CacheableDecoratorType} from "@app/gateway/common";
import {CacheService, RedisKey} from "@live-bid/services/cache";
import {getRequestResponse} from "@app/gateway/lib";

@Injectable()
export class CacheableInterceptor<T> implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CacheService,
  ) {}

  async intercept(ctx: ExecutionContext, next: CallHandler<T>): Promise<Observable<T> | Observable<Promise<T>>> {
    const cacheableKey = this.reflector.getAllAndOverride<CacheableDecoratorType>(CACHEABLE_KEY, [
      ctx.getClass(),
      ctx.getHandler(),
    ]);

    if (!cacheableKey) return next.handle();

    const {req} = getRequestResponse(ctx);

    // build key pattern
    const key: string = RedisKey.keyPrefix({
      req,
      paramsKey: cacheableKey.paramsKey,
      extraKeys: cacheableKey.extraKeys,
      resource: cacheableKey.resource,
      pagination: cacheableKey.pagination,
      self: cacheableKey.self,
      query: cacheableKey.query,
    });

    try {
      // check exist cached
      const cacheValue = await this.cache.get<T>(key);

      // exist cached
      if (cacheValue !== null) return from([cacheValue]);
    } catch (e) {
      throw new InternalServerErrorException({
        message: (e as Error).message ?? (e as Error).cause ?? 'error in cacheable.interceptor',
        error: (e as Error).name ?? 'error in getting cache',
      });
    }

    return next.handle().pipe(
      mergeMap(async data => {

        try {
          // set value with key
          await this.cache.set(key, data, cacheableKey.ttl);
        } catch (e) {
          throw new InternalServerErrorException({
            message: (e as Error).message ?? (e as Error).cause ?? 'error in cacheable.interceptor',
            error: (e as Error).name ?? 'error in setting cache',
          });
        }

        return data;
      })
    );
  }
}
