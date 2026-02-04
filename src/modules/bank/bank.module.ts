import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { BankBranch } from './entities/bank-branch.entity';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bank, BankBranch]),
  ],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
