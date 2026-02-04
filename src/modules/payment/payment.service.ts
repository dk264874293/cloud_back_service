import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './payment.entity';
import { OrderService } from '../order/order.service';
import { User } from '../user/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly orderService: OrderService,
  ) {}

  async createPayment(
    payerId: number,
    data: {
      orderType: string;
      orderId: number;
      paymentType: PaymentType;
    },
  ): Promise<{
    codeUrl?: string;
    jsapiParams?: Record<string, any>;
    paymentNo: string;
    amount: number;
  }> {
    const order = await this.orderService.getConnectionOrder(data.orderId);

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'WAITING_PURCHASE') {
      throw new BadRequestException('订单状态不正确，无法支付');
    }

    const paymentNo = `PAY${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const payment = new Payment();
    payment.paymentNo = paymentNo;
    payment.orderType = data.orderType as any;
    payment.orderId = data.orderId;
    payment.orderNo = order.order_no;
    payment.payerId = payerId;
    payment.amount = order.price;
    payment.paymentType = data.paymentType;
    payment.status = PaymentStatus.PENDING;

    const savedPayment = await this.paymentRepository.save(payment);

    let result: {
      codeUrl?: string;
      jsapiParams?: Record<string, any>;
      paymentNo: string;
      amount: number;
    } = {
      paymentNo: savedPayment.paymentNo,
      amount: order.price,
    };

    return result;
  }

  async handlePaymentCallback(callbackData: any): Promise<void> {
    const isValid = await this.verifyCallback(callbackData);

    if (!isValid) {
      throw new BadRequestException('支付回调验证失败');
    }

    const outTradeNo = callbackData.out_trade_no;
    const payment = await this.paymentRepository.findOne({
      where: { paymentNo: outTradeNo },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return;
    }

    payment.status = PaymentStatus.PAID;
    payment.transactionId = callbackData.transaction_id;
    payment.paidAt = new Date();
    payment.callbackData = callbackData;

    await this.paymentRepository.save(payment);
  }

  async refundPayment(
    paymentId: number,
    reason: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('只能退款已支付的订单');
    }

    await this.processRefund(payment.transactionId, payment.amount, reason);

    payment.status = PaymentStatus.REFUNDED;

    return await this.paymentRepository.save(payment);
  }

  async getPaymentByOrder(orderId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentByPaymentNo(paymentNo: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentNo },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  private async verifyCallback(_data: any): Promise<boolean> {
    return true;
  }

  private async processRefund(
    _transactionId: string,
    _refundAmount: number,
    _reason: string,
  ): Promise<void> {}
}
