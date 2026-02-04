import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { User } from '../user/user.entity';
import { ConnectionOrder } from '../order/entities/connection-order.entity';
import { PaymentService } from './payment.service';
import { WechatPayService } from './wechat-pay.service';
import { PaymentController } from './payment.controller';
import { OrderModule } from '../order/order.module';
import { ConfigModule } from '@/config/config.module';
import { ConfigService } from '@/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User, ConnectionOrder]),
    OrderModule,
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    WechatPayService,
    {
      provide: ConfigService,
      useFactory: () => new ConfigService(),
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
