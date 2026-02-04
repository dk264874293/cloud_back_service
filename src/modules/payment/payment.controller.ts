import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
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
import { PaymentService } from './payment.service';
import { CreatePaymentDto, CreatePaymentResponseDto, RefundDto } from './dto/create-payment.dto';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @Roles(UserRole.BANK)
  @ApiOperation({ summary: '创建支付订单' })
  @ApiResponse({ status: 200, type: ResponseDto<CreatePaymentResponseDto> })
  async createPayment(
    @CurrentUser('id') payerId: number,
    @Body() dto: CreatePaymentDto,
  ): Promise<ResponseDto<CreatePaymentResponseDto>> {
    const result = await this.paymentService.createPayment(payerId, dto);
    return {
      code: 0,
      message: '支付订单创建成功',
      data: result,
    };
  }

  @Post('callback/wechat')
  @ApiOperation({ summary: '微信支付回调' })
  @ApiResponse({ status: 200 })
  async handleWechatCallback(@Body() callbackData: any): Promise<void> {
    await this.paymentService.handlePaymentCallback(callbackData);
  }

  @Put(':id/refund')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '申请退款' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async refundPayment(
    @Param('id') paymentId: number,
    @Body() dto: RefundDto,
  ): Promise<ResponseDto> {
    const payment = await this.paymentService.refundPayment(paymentId, dto.reason);
    return {
      code: 0,
      message: '退款申请成功',
      data: payment,
    };
  }

  @Get('order/:orderId')
  @Roles(UserRole.ADMIN, UserRole.BANK)
  @ApiOperation({ summary: '获取订单的支付记录' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getPaymentByOrder(
    @Param('orderId') orderId: number,
  ): Promise<ResponseDto> {
    const payments = await this.paymentService.getPaymentByOrder(orderId);
    return {
      code: 0,
      message: '获取成功',
      data: payments,
    };
  }
}
