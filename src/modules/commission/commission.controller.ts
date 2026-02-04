import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CommissionService } from './commission.service';
import { CreateCommissionRuleDto, UpdateCommissionRuleDto } from './dto/commission.dto';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('commission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('records')
  @ApiOperation({ summary: '获取分佣记录' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getCommissionRecords(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    if (userRole !== UserRole.ADMIN && userId) {
      throw new Error('只能查看自己的分佣记录');
    }

    const result = await this.commissionService.getCommissionRecords(
      userRole === UserRole.ADMIN ? undefined : userId,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Post('pay/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '支付佣金' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async payCommission(@Param('id') commissionId: number): Promise<ResponseDto> {
    const record = await this.commissionService.payCommission(commissionId);
    return {
      code: 0,
      message: '支付成功',
      data: record,
    };
  }

  @Get('rules')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取分佣规则列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getCommissionRules(): Promise<ResponseDto> {
    const rules = await this.commissionService.getCommissionRules();
    return {
      code: 0,
      message: '获取成功',
      data: rules,
    };
  }

  @Post('rules')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建分佣规则' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createCommissionRule(
    @Body() dto: CreateCommissionRuleDto,
  ): Promise<ResponseDto> {
    const rule = await this.commissionService.createCommissionRule(dto);
    return {
      code: 0,
      message: '创建成功',
      data: rule,
    };
  }

  @Put('rules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新分佣规则' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async updateCommissionRule(
    @Param('id') id: number,
    @Body() dto: UpdateCommissionRuleDto,
  ): Promise<ResponseDto> {
    const rule = await this.commissionService.updateCommissionRule(id, dto);
    return {
      code: 0,
      message: '更新成功',
      data: rule,
    };
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除分佣规则' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteCommissionRule(@Param('id') id: number): Promise<ResponseDto> {
    await this.commissionService.deleteCommissionRule(id);
    return {
      code: 0,
      message: '删除成功',
    };
  }
}
