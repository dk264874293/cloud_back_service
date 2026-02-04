export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface JwtConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface WeChatPayConfig {
  appId: string;
  mchId: string;
  apiV3Key: string;
  certPath: string;
  certSerialNo: string;
  notifyUrl: string;
}

export interface AliyunOssConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint: string;
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface AllConfig {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  wechatPay: WeChatPayConfig;
  aliyunOss: AliyunOssConfig;
  fileUpload: FileUploadConfig;
}
