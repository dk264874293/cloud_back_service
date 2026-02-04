import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { OssService } from './oss.service';
import { ConfigService } from '@/config/config.service';
import { UploadedFile } from './oss.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly ossService: OssService,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    uploadedBy: number,
    file: UploadedFile,
    category?: string,
  ): Promise<File> {
    const maxSize = this.configService.fileUpload.maxFileSize;
    const allowedTypes = this.configService.fileUpload.allowedFileTypes;

    if (!this.ossService.validateFileSize(file.size, maxSize)) {
      throw new BadRequestException(`文件大小超过限制，最大 ${maxSize} 字节`);
    }

    if (!this.ossService.validateFileType(file.originalname, allowedTypes)) {
      throw new BadRequestException(`不支持的文件类型，仅支持 ${allowedTypes.join(', ')}`);
    }

    const ossResult = await this.ossService.uploadFile(file, category);

    const fileEntity = new File();
    fileEntity.uuid = ossResult.uuid;
    fileEntity.uploadedById = uploadedBy;
    fileEntity.originalName = file.originalname;
    fileEntity.mimeType = file.originalname.split('.').pop() || '';
    fileEntity.url = ossResult.url;
    fileEntity.path = ossResult.path;
    fileEntity.size = file.size;
    fileEntity.category = category || '';

    return await this.fileRepository.save(fileEntity);
  }

  async getFileById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    return file;
  }

  async getFilesByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ files: File[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [files, total] = await this.fileRepository.findAndCount({
      where: { uploadedById: userId },
      relations: ['uploadedBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { files, total, page, limit };
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, uploadedById: userId },
    });

    if (!file) {
      throw new NotFoundException('文件不存在或无权删除');
    }

    await this.ossService.deleteFile(file.path);
    await this.fileRepository.delete(id);
  }
}
