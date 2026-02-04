import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { User } from '../user/user.entity';
import { FileService } from './file.service';
import { OssService } from './oss.service';
import { FileController } from './file.controller';
import { ConfigModule } from '@/config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([File, User]), ConfigModule],
  controllers: [FileController],
  providers: [FileService, OssService],
  exports: [FileService, OssService],
})
export class FileModule {}
