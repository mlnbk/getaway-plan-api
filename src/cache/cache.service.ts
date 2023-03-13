import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private expiration!: number;
  redis!: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.expiration = this.configService.get<number>('CACHE_EXPIRATION') ?? 120;
    await this.initRedis();
  }

  private async initRedis() {
    this.redis = createClient({
      url: this.configService.get<string>('REDIS_URL'),
    });
    this.redis.on('error', (error) => console.log('Redis Client Error', error));
    await this.redis.connect();
  }

  async getAllKeys() {
    return this.redis.sendCommand(['keys', '*']);
  }

  async getItem(key: string) {
    const result = await this.redis.get(key);
    if (!result) {
      this.logger.debug(`Cache miss for key ${key}`);
      return;
    }
    return JSON.parse(result);
  }

  async setItem(key: string, value: any, expiration?: number) {
    await this.redis.set(key, JSON.stringify(value), {
      EX: expiration ?? this.expiration,
    });
  }

  async invalidateKeys(pattern: string) {
    this.logger.log(`invalidateKeys: ${pattern}`);
    const keys = await this.redis.keys(pattern);
    for await (const key of keys) {
      await this.redis.del(key);
    }
  }

  async flushAll() {
    return this.redis.flushAll();
  }
}
