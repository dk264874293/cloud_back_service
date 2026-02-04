import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConfig = registerAs('REDIS', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 分钟 TTL
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'sp:', // ServiceProvider 缓存前缀
}));

export type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
  keyPrefix: string;
};
