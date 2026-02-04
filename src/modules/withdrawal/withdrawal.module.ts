import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './withdrawal.entity';
import { User } from '../user/entities/user.entity';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal, User]),
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
