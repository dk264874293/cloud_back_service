import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOrder } from './entities/connection-order.entity';
import { EntrustmentOrder } from './entities/entrustment-order.entity';
import { OrderLog } from './entities/order-log.entity';
import { User } from '../user/user.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderStateMachine } from './order-status.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConnectionOrder,
      EntrustmentOrder,
      OrderLog,
      User,
    ]),
    UserModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderStateMachine],
  exports: [OrderService],
})
export class OrderModule {}
