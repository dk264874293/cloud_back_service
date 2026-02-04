import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../user/entities/user.entity';
import { ServiceProvider } from '../service-provider/entities/service-provider.entity';
import { Bank } from '../bank/entities/bank.entity';
import { Withdrawal } from '../withdrawal/withdrawal.entity';
import { Feedback } from '../feedback/feedback.entity';
import { OperationLog } from '../log/operation-log.entity';
import { ServiceProviderModule } from '../service-provider/service-provider.module';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';
import { LogService } from '../log/log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ServiceProvider,
      Bank,
      Withdrawal,
      Feedback,
      OperationLog,
    ]),
    ServiceProviderModule,
    WithdrawalModule,
  ],
  controllers: [AdminController],
  providers: [LogService],
})
export class AdminModule {}
