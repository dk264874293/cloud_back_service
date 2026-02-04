import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { User } from '../user/user.entity';
import { ConnectionOrder } from '../order/entities/connection-order.entity';
import { PaymentService } from './payment.service';
import { WechatPayService } from './wechat-pay.service';
import { PaymentController } from './payment.controller';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User, ConnectionOrder]),
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, WechatPayService],
  exports: [PaymentService],
})
export class PaymentModule {}
