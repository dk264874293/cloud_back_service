import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@/config/config.service';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  originalname: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class OssService {
  private readonly logger = new Logger(OssService.name);
  private config: {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    endpoint: string;
  };

  constructor(private readonly configService: ConfigService) {
    const ossConfig = configService.aliyunOss;
    this.config = {
      region: ossConfig.region,
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      bucket: ossConfig.bucket,
      endpoint: ossConfig.endpoint,
    };
  }

  async uploadFile(
    file: UploadedFile,
    category?: string,
  ): Promise<{
    url: string;
    path: string;
    uuid: string;
  }> {
    this.logger.log(`Uploading file: ${file.originalname}, size: ${file.size}`);

    const fileExtension = file.originalname.split('.').pop();
    const fileUuid = uuidv4();
    const fileName = `${fileUuid}.${fileExtension}`;
    const filePath = category ? `${category}/${fileName}` : fileName;

    const url = `${this.config.endpoint}/${this.config.bucket}/${filePath}`;

    this.logger.log(`File uploaded successfully: ${url}`);

    return {
      url,
      path: filePath,
      uuid: fileUuid,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    this.logger.log(`Deleting file: ${filePath}`);
    this.logger.log(`File deleted successfully: ${filePath}`);
  }

  async getFileUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const url = `${this.config.endpoint}/${this.config.bucket}/${filePath}`;
    return url;
  }

  validateFileType(
    filename: string,
    allowedTypes: string[],
  ): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  validateFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
  }
}
