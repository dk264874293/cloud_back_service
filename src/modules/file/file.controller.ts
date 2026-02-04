import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseDto } from '@/common/dto/response.dto';
import { FileService } from './file.service';
import { UploadedFile as UploadFileType } from './oss.service';

@ApiTags('file')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传文件' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async uploadFile(
    @UploadedFile() file: UploadFileType,
    @CurrentUser('id') userId: number,
    @Query('category') category?: string,
  ): Promise<ResponseDto> {
    const uploadedFile = await this.fileService.uploadFile(userId, file, category);
    return {
      code: 0,
      message: '上传成功',
      data: uploadedFile,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件信息' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getFile(@Param('id') id: number): Promise<ResponseDto> {
    const file = await this.fileService.getFileById(id);
    return {
      code: 0,
      message: '获取成功',
      data: file,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取用户的文件列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getFilesByUser(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.fileService.getFilesByUser(
      userId,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteFile(
    @Param('id') id: number,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto> {
    await this.fileService.deleteFile(id, userId);
    return {
      code: 0,
      message: '删除成功',
    };
  }
}
