import { Injectable } from '@nestjs/common';
import {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  WeChatPayConfig,
  AliyunOssConfig,
  FileUploadConfig,
  AllConfig,
} from './config.interface';

@Injectable()
export class ConfigService {
  private readonly config: AllConfig;

  constructor() {
    this.config = {
      app: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        apiPrefix: process.env.API_PREFIX || 'api',
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'yinhang_platform',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'dev-super-secret-jwt-key',
        accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
      },
      wechatPay: {
        appId: process.env.WECHAT_PAY_APP_ID || '',
        mchId: process.env.WECHAT_PAY_MCH_ID || '',
        apiV3Key: process.env.WECHAT_PAY_API_V3_KEY || '',
        certPath: process.env.WECHAT_PAY_CERT_PATH || '',
        certSerialNo: process.env.WECHAT_PAY_CERT_SERIAL_NO || '',
        notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
      },
      aliyunOss: {
        region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
        accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID || '',
        accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || '',
        bucket: process.env.ALIYUN_OSS_BUCKET || '',
        endpoint: process.env.ALIYUN_OSS_ENDPOINT || 'https://oss-cn-hangzhou.aliyuncs.com',
      },
      fileUpload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
        allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf').split(','),
      },
    };
  }

  get app(): AppConfig {
    return this.config.app;
  }

  get database(): DatabaseConfig {
    return this.config.database;
  }

  get jwt(): JwtConfig {
    return this.config.jwt;
  }

  get wechatPay(): WeChatPayConfig {
    return this.config.wechatPay;
  }

  get aliyunOss(): AliyunOssConfig {
    return this.config.aliyunOss;
  }

  get fileUpload(): FileUploadConfig {
    return this.config.fileUpload;
  }
}
