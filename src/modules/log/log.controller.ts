import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { ResponseDto } from '@/common/dto/response.dto';
import { LogService } from './log.service';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取操作日志列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getLogs(
    @Query('userId') userId?: number,
    @Query('module') module?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.logService.getLogs(
      userId,
      module,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Delete('before/:date')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除指定日期之前的日志' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteLogsBeforeDate(@Param('date') date: string): Promise<ResponseDto> {
    const count = await this.logService.deleteLogsBefore(new Date(date));
    return {
      code: 0,
      message: `删除了 ${count} 条日志`,
    };
  }
}
