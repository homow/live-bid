import type {Request} from "express";
import {Reflector} from "@nestjs/core";
import {mergeMap, Observable} from "rxjs";
import {AppException} from "@live-bid/services/lib";
import {getRequestResponse} from "@app/gateway/lib";
import {AccessRequest} from "@live-bid/services/types";
import {CacheService, RedisKey} from "@live-bid/services/cache";
import {CACHE_EVICT_KEY, CacheEvictDecorator} from "@app/gateway/common";
import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";

type CacheEvictInterceptorDeleteType = "delete" | "deletePrefix";

@Injectable()
export class CacheEvictInterceptor implements NestInterceptor {
  constructor(
    private readonly cache: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async deleteAction(key: string, action: CacheEvictInterceptorDeleteType) {
    try {
      if (action === 'delete') {
        await this.cache.delete(key);
      } else {
        await this.cache.deletePrefix(key);
      }
    } catch (e) {
      throw new AppException({
        statusCode: 500,
        code: (e as Error).name ?? 'error in deleting cache',
        message: (e as Error).message || 'error in cache-evict.interceptor while deleting a cache key',
      });
    }
  }

  intercept(ctx: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> | Promise<Observable<unknown>> {
    const cacheParams = this.reflector.getAllAndOverride<CacheEvictDecorator>(CACHE_EVICT_KEY, [
      ctx.getClass(),
      ctx.getHandler()
    ]);

    if (!cacheParams) return next.handle();

    return next.handle().pipe(
      mergeMap(async data => {

        const evict = async (key: string, action: CacheEvictInterceptorDeleteType) => {
          await this.deleteAction(key, action);
          return data;
        };

        if ('resource' in cacheParams && !('findPrefix' in cacheParams)) {

          // if cache params exist
          if (cacheParams?.force) {
            const finalKey = `*${cacheParams.resource}*`;
            await evict(finalKey, 'deletePrefix');
          }

          if (cacheParams?.forcePagination) {
            const finalKey = `*${cacheParams.resource}:list*`;
            await evict(finalKey, 'deletePrefix');
          }

          const {req} = getRequestResponse<AccessRequest>(ctx);

          const key: string = RedisKey.keyPrefix({
            req,
            self: cacheParams.self,
            query: cacheParams.query,
            resource: cacheParams.resource,
            paramsKey: cacheParams.paramsKey,
            extraKeys: cacheParams.extraKeys,
          });

          if (cacheParams.prefixAfterBuildKey) {
            const finalKey = `*${key}*`;
            await evict(finalKey, 'deletePrefix');
          } else {
            await evict(key, 'delete');
          }
        }

        if ('prefix' in cacheParams && cacheParams.prefix?.trim()) {
          const finalKey = `*${cacheParams.prefix}*`;
          await evict(finalKey, 'deletePrefix');
        }

        if ('findPrefix' in cacheParams) {
          const req = ctx.switchToHttp().getRequest<Request>();
          const keyParam: string = cacheParams.findPrefix.param;
          const rawParam: string | string[] = req.params[keyParam];
          const paramValue: string = Array.isArray(rawParam) ? rawParam[0] : rawParam;

          if ('resource' in cacheParams) {

            if (cacheParams.findPrefix.extraKeys?.length) {
              const extraKeys: string = cacheParams.findPrefix.extraKeys.join(":");

              const finalKey = `*${cacheParams.resource}:${extraKeys}:${keyParam}=${paramValue}*`;
              await evict(finalKey, 'deletePrefix');

            } else {
              const replaceKey = cacheParams.findPrefix.paramKeyReplace;

              if (replaceKey) {
                const finalKey = cacheParams.findPrefix?.listOrSingle === 'single'
                  ? `*${cacheParams.resource}:${replaceKey}=${paramValue}*`
                  : `*${cacheParams.resource}:${replaceKey}=${paramValue}*:list`;

                await evict(finalKey, 'deletePrefix');
              }

              const finalKey = `*${cacheParams.resource}:${paramValue}:list*`;
              await evict(finalKey, 'deletePrefix');
            }

          } else {
            const finalKey = `*${paramValue}*`;
            await evict(finalKey, 'delete');
          }
        }

        return data;
      })
    );
  }
}
