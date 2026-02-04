import { Injectable, Optional, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { redisConfig, RedisConfig } from '../../config/redis.config';
import { Cache } from 'cache-manager';

/**
 * 服务商缓存服务
 * 管理层级查询的 Redis 缓存
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(redisConfig.KEY) private config: any,
    @Optional() private cache?: Cache,
  ) {}

  /**
   * 获取后代缓存
   */
  async getDescendantsCache(id: number): Promise<any> {
    const key = `${this.config.keyPrefix}${id}:descendants`;
    return this.cache?.get(key);
  }

  /**
   * 设置后代缓存
   */
  async setDescendantsCache(
    id: number,
    data: any,
    ttl?: number,
  ): Promise<void> {
    const key = `${this.config.keyPrefix}${id}:descendants`;
    const cacheTtl = ttl || this.config.ttl;
    await this.cache?.set(key, data, { ttl: cacheTtl } as any);
  }

  /**
   * 获取祖先缓存
   */
  async getAncestorsCache(id: number): Promise<any> {
    const key = `${this.config.keyPrefix}${id}:ancestors`;
    return this.cache?.get(key);
  }

  /**
   * 设置祖先缓存
   */
  async setAncestorsCache(id: number, data: any, ttl?: number): Promise<void> {
    const key = `${this.config.keyPrefix}${id}:ancestors`;
    const cacheTtl = ttl || this.config.ttl;
    await this.cache?.set(key, data, { ttl: cacheTtl } as any);
  }

  /**
   * 获取路径缓存
   */
  async getPathCache(id: number): Promise<any> {
    const key = `${this.config.keyPrefix}${id}:path`;
    return this.cache?.get(key);
  }

  /**
   * 设置路径缓存
   */
  async setPathCache(id: number, data: any, ttl?: number): Promise<void> {
    const key = `${this.config.keyPrefix}${id}:path`;
    const cacheTtl = ttl || this.config.ttl;
    await this.cache?.set(key, data, { ttl: cacheTtl } as any);
  }

  /**
   * 获取统计缓存
   */
  async getStatsCache(id: number): Promise<any> {
    const key = `${this.config.keyPrefix}${id}:stats`;
    return this.cache?.get(key);
  }

  /**
   * 设置统计缓存
   */
  async setStatsCache(id: number, data: any, ttl?: number): Promise<void> {
    const key = `${this.config.keyPrefix}${id}:stats`;
    const cacheTtl = ttl || this.config.ttl;
    await this.cache?.set(key, data, { ttl: cacheTtl } as any);
  }

  /**
   * 清除节点的所有相关缓存
   */
  async invalidateNodeCache(id: number): Promise<void> {
    const key = `${this.config.keyPrefix}${id}`;
    const keys = [
      `${key}:descendants`,
      `${key}:ancestors`,
      `${key}:path`,
      `${key}:stats`,
    ];

    try {
      await this.cache?.del(keys as any);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache for node ${id}:`, error);
    }
  }

  /**
   * 清除父节点的后代缓存
   */
  async invalidateDescendantsCache(parentId: number): Promise<void> {
    const key = `${this.config.keyPrefix}${parentId}:descendants`;
    try {
      await this.cache?.del(key);
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate descendants cache for node ${parentId}:`,
        error,
      );
    }
  }

  /**
   * 清除所有以指定前缀开头的缓存
   */
  async invalidateAllCache(): Promise<void> {
    if (!this.cache) {
      return;
    }

    try {
      const cacheStores = (this.cache as any).stores;
      if (Array.isArray(cacheStores)) {
        for (const store of cacheStores) {
          if ('keys' in store) {
            const keys = await (store as any).keys(`${this.config.keyPrefix}*`);
            if (keys?.length > 0) {
              await this.cache.del(keys);
            }
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate all cache:`, error);
    }
  }
}
