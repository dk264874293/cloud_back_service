import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { OrderType } from '@/common/enums/order-status.enum';
import { PaymentType } from '../payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'CONNECTION', description: '订单类型' })
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType!: OrderType;

  @ApiProperty({ example: 123, description: '订单ID' })
  @IsNumber()
  @IsNotEmpty()
  orderId!: number;

  @ApiProperty({ example: 'JSAPI', description: '支付方式' })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType!: PaymentType;
}

export class PaymentCallbackDto {
  @ApiProperty({ example: 'data', description: '微信支付回调数据' })
  @IsNotEmpty()
  data!: any;
}

export class RefundDto {
  @ApiProperty({ example: '申请退款', description: '退款原因' })
  @IsNotEmpty()
  reason!: string;
}

export class CreatePaymentResponseDto {
  @ApiProperty({ example: 'weixin://wxpay/bizpayurl?pr=xxx', description: 'Native支付码链接', required: false })
  codeUrl?: string;

  @ApiProperty({ example: { timeStamp: '1234567890', nonceStr: 'xxx', package: 'prepay_id=xxx', signType: 'RSA', paySign: 'xxx' }, description: 'JSAPI支付参数', required: false })
  jsapiParams?: Record<string, any>;

  @ApiProperty({ example: 'PAY2026020200001', description: '支付单号' })
  paymentNo!: string;

  @ApiProperty({ example: 5000.00, description: '支付金额' })
  amount!: number;
}
