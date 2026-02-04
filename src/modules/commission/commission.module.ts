import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionRule } from './commission-rule.entity';
import { CommissionRecord } from './commission-record.entity';
import { User } from '../user/user.entity';
import { ConnectionOrder } from '../order/entities/connection-order.entity';
import { EntrustmentOrder } from '../order/entities/entrustment-order.entity';
import { CommissionService } from './commission.service';
import { CommissionCalculationService } from './commission-calculation.service';
import { CommissionController } from './commission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommissionRule,
      CommissionRecord,
      User,
      ConnectionOrder,
      EntrustmentOrder,
    ]),
  ],
  controllers: [CommissionController],
  providers: [CommissionService, CommissionCalculationService],
  exports: [CommissionService],
})
export class CommissionModule {}
