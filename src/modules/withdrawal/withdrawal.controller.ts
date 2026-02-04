import {
  Controller,
  Get,
  Post,
  Put,
  Body,
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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseDto } from '@/common/dto/response.dto';
import { WithdrawalService } from './withdrawal.service';
import { AccountType, WithdrawalStatus } from './withdrawal.entity';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('withdrawal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有提现申请列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getAllWithdrawals(
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

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取提现申请详情' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getWithdrawal(@Param('id') id: number): Promise<ResponseDto> {
    const withdrawal = await this.withdrawalService.getWithdrawalById(id);
    return {
      code: 0,
      message: '获取成功',
      data: withdrawal,
    };
  }

  @Put(':id/approve')
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

  @Put(':id/reject')
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
}

@ApiTags('user-withdrawal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user/withdrawals')
export class UserWithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '获取我的提现申请列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getMyWithdrawals(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.withdrawalService.getWithdrawalsByUser(
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

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '创建提现申请' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createWithdrawal(
    @CurrentUser('id') userId: number,
    @Body('amount') amount: number,
    @Body('accountType') accountType: AccountType,
    @Body('accountInfo') accountInfo: Record<string, any>,
  ): Promise<ResponseDto> {
    const withdrawal = await this.withdrawalService.createWithdrawal(
      userId,
      amount,
      accountType,
      accountInfo,
    );
    return {
      code: 0,
      message: '创建成功',
      data: withdrawal,
    };
  }
}
