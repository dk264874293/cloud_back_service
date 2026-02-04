import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  Delete,
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
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { LogService } from '../log/log.service';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
    private readonly withdrawalService: WithdrawalService,
    private readonly logService: LogService,
  ) {}

  @Get('customers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取客户列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getCustomers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.serviceProviderService.getServiceProviders(
      undefined,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Get('service-providers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取服务商列表' })
  @ApiResponse({ status:  200, type: ResponseDto })
  async getServiceProviders(
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.serviceProviderService.getServiceProviders(
      type as any,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Get('withdrawals')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取提现申请列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getWithdrawals(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.withdrawalService.getAllWithdrawals(
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Put('withdrawals/:id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '审核通过提现' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async approveWithdrawal(
    @Param('id') id: number,
    @Body('note') note: string,
  ): Promise<ResponseDto> {
    const withdrawal = await this.withdrawalService.approveWithdrawal(id, note);
    return {
      code: 0,
      message: '审核通过',
      data: withdrawal,
    };
  }

  @Put('withdrawals/:id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '拒绝提现' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async rejectWithdrawal(
    @Param('id') id: number,
    @Body('reason') reason: string,
  ): Promise<ResponseDto> {
    const withdrawal = await this.withdrawalService.rejectWithdrawal(id, reason);
    return {
      code: 0,
      message: '拒绝成功',
      data: withdrawal,
    };
  }

  @Put('withdrawals/:id/complete')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '完成提现' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async completeWithdrawal(
    @Param('id') id: number,
  ): Promise<ResponseDto> {
    const withdrawal = await this.withdrawalService.completeWithdrawal(id);
    return {
      code: 0,
      message: '完成成功',
      data: withdrawal,
    };
  }

  @Get('logs')
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

  @Delete('logs/before/:date')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除指定日期之前的日志' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteLogsBeforeDate(
    @Param('date') date: string,
  ): Promise<ResponseDto> {
    const count = await this.logService.deleteLogsBefore(new Date(date));
    return {
      code: 0,
      message: `删除了 ${count} 条日志`,
    };
  }
}
