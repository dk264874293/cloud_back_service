import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseDto } from '@/common/dto/response.dto';
import { OrderService } from './order.service';
import { ConnectionOrder } from './entities/connection-order.entity';
import { EntrustmentOrder } from './entities/entrustment-order.entity';
import { OrderLog } from './entities/order-log.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { OrderType } from '@/common/enums/order-status.enum';

@ApiTags('order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('connection')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '创建对接订单' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async createConnectionOrder(
    @CurrentUser('id') userId: number,
    @Body()
    body: {
      userType: string;
      needType: string;
      location: string;
      amount: number;
      repaymentAbility?: string;
    },
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.createConnectionOrder(userId, body);
    return {
      code: 0,
      message: '订单创建成功',
      data: order,
    };
  }

  @Put('connection/:id/assign-manager')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '分配管户人' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async assignAccountManager(
    @Param('id') orderId: number,
    @Body('accountManagerId') accountManagerId: number,
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.assignAccountManager(
      orderId,
      accountManagerId,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '管户人分配成功',
      data: order,
    };
  }

  @Put('connection/:id/upload-report')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: '上传客户需求报告' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async uploadReport(
    @Param('id') orderId: number,
    @Body('reportUrl') reportUrl: string,
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.uploadReport(
      orderId,
      reportUrl,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '报告上传成功',
      data: order,
    };
  }

  @Put('connection/:id/set-price')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '设置价格和分配银行' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async setPriceAndAssignBanks(
    @Param('id') orderId: number,
    @Body()
    body: {
      price: number;
      assignedBanks: number[];
    },
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.setPriceAndAssignBanks(
      orderId,
      body.price,
      body.assignedBanks,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '价格和银行设置成功',
      data: order,
    };
  }

  @Put('connection/:id/confirm-meeting')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: '管户人确认会议' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async confirmMeeting(
    @Param('id') orderId: number,
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.confirmMeeting(
      orderId,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '会议确认成功',
      data: order,
    };
  }

  @Put('connection/:id/bank-confirm')
  @Roles(UserRole.BANK)
  @ApiOperation({ summary: '银行确认购买' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async bankConfirm(
    @Param('id') orderId: number,
    @CurrentUser('id') bankManagerId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.bankConfirm(
      orderId,
      bankManagerId,
      operatorRole,
    );
    return {
      code: 0,
      message: '银行确认成功',
      data: order,
    };
  }

  @Put('connection/:id/select-bank')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '用户选择银行' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async selectBank(
    @Param('id') orderId: number,
    @Body('selectedBankId') selectedBankId: number,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.selectBank(
      orderId,
      userId,
      selectedBankId,
    );
    return {
      code: 0,
      message: '银行选择成功',
      data: order,
    };
  }

  @Get('bank/pool')
  @Roles(UserRole.BANK)
  @ApiOperation({ summary: '银行查看可购买订单池' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder[]> })
  async getBankPool(): Promise<ResponseDto<ConnectionOrder[]>> {
    const orders = await this.orderService.getBankPool();
    return {
      code: 0,
      message: '获取成功',
      data: orders,
    };
  }

  @Get('connection')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '获取用户的对接订单列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getConnectionOrders(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.orderService.getConnectionOrders(
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

  @Put('connection/:id/cancel')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '取消对接订单' })
  @ApiResponse({ status: 200, type: ResponseDto<ConnectionOrder> })
  async cancelConnectionOrder(
    @Param('id') orderId: number,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto<ConnectionOrder>> {
    const order = await this.orderService.cancelConnectionOrder(
      orderId,
      userId,
      reason,
    );
    return {
      code: 0,
      message: '订单取消成功',
      data: order,
    };
  }

  @Post('entrustment')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '创建委托订单' })
  @ApiResponse({ status: 200, type: ResponseDto<EntrustmentOrder> })
  async createEntrustmentOrder(
    @CurrentUser('id') userId: number,
    @Body('connectionOrderId') connectionOrderId: number,
  ): Promise<ResponseDto<EntrustmentOrder>> {
    const order = await this.orderService.createEntrustmentOrder(
      userId,
      connectionOrderId,
    );
    return {
      code: 0,
      message: '委托订单创建成功',
      data: order,
    };
  }

  @Post('entrustment/:id/upload-agreement')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: '上传委托协议' })
  @ApiResponse({ status: 200, type: ResponseDto<EntrustmentOrder> })
  async uploadAgreement(
    @Param('id') orderId: number,
    @Body('agreementUrl') agreementUrl: string,
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<EntrustmentOrder>> {
    const order = await this.orderService.uploadAgreement(
      orderId,
      agreementUrl,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '协议上传成功',
      data: order,
    };
  }

  @Put('entrustment/:id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '审核委托订单' })
  @ApiResponse({ status: 200, type: ResponseDto<EntrustmentOrder> })
  async approveEntrustmentOrder(
    @Param('id') orderId: number,
    @Body()
    body: {
      approved: boolean;
      note: string;
    },
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<EntrustmentOrder>> {
    const order = await this.orderService.approveEntrustmentOrder(
      orderId,
      body.approved,
      body.note,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: body.approved ? '审核通过' : '审核拒绝',
      data: order,
    };
  }

  @Post('entrustment/:id/accept-handler')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: '接受委托' })
  @ApiResponse({ status: 200, type: ResponseDto<EntrustmentOrder> })
  async acceptHandler(
    @Param('id') orderId: number,
    @Body('handlerId') handlerId: number,
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<EntrustmentOrder>> {
    const order = await this.orderService.acceptHandler(
      orderId,
      handlerId,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '委托接受成功',
      data: order,
    };
  }

  @Put('entrustment/:id/complete')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: '完成委托订单' })
  @ApiResponse({ status: 200, type: ResponseDto<EntrustmentOrder> })
  async completeEntrustmentOrder(
    @Param('id') orderId: number,
    @Body('completionNote') completionNote: string,
    @CurrentUser('id') operatorId: number,
    @CurrentUser('role') operatorRole: string,
  ): Promise<ResponseDto<EntrustmentOrder>> {
    const order = await this.orderService.completeEntrustmentOrder(
      orderId,
      completionNote,
      operatorId,
      operatorRole,
    );
    return {
      code: 0,
      message: '委托完成',
      data: order,
    };
  }

  @Get('logs/:id')
  @ApiOperation({ summary: '获取订单日志' })
  @ApiResponse({ status: 200, type: ResponseDto<OrderLog[]> })
  async getOrderLogs(
    @Param('id') orderId: number,
    @Query('orderType') orderType: OrderType,
  ): Promise<ResponseDto<OrderLog[]>> {
    const logs = await this.orderService.getOrderLogs(orderId, orderType);
    return {
      code: 0,
      message: '获取成功',
      data: logs,
    };
  }
}
