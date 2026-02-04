import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { ConfigService } from '@/config/config.service';
import { User } from '../user/entities/user.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity';
import { Bank } from '../bank/bank.entity';
import { Withdrawal } from '../withdrawal/withdrawal.entity';
import { Feedback } from '../feedback/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ServiceProvider,
      Bank,
      Withdrawal,
      Feedback,
    ]),
  ],
  controllers: [AdminController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AdminModule {}
