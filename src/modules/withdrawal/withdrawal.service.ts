import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal, WithdrawalStatus, AccountType } from './withdrawal.entity';
import { User } from '../user/user.entity';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {}

  async createWithdrawal(
    userId: number,
    amount: number,
    accountType: AccountType,
    accountInfo: Record<string, any>,
  ): Promise<Withdrawal> {
    const withdrawal = new Withdrawal();
    withdrawal.withdrawalNo = `WIT${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    withdrawal.userId = userId;
    withdrawal.amount = amount;
    withdrawal.accountType = accountType;
    withdrawal.accountInfo = accountInfo;
    withdrawal.status = WithdrawalStatus.PENDING;

    return await this.withdrawalRepository.save(withdrawal);
  }

  async getWithdrawalsByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    withdrawals: Withdrawal[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { withdrawals, total, page, limit };
  }

  async getAllWithdrawals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    withdrawals: Withdrawal[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await this.withdrawalRepository.findAndCount({
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { withdrawals, total, page, limit };
  }

  async approveWithdrawal(
    id: number,
    note: string,
  ): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现申请不存在');
    }

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.reviewNote = note;
    withdrawal.reviewedAt = new Date();

    return await this.withdrawalRepository.save(withdrawal);
  }

  async getWithdrawalById(id: number): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现申请不存在');
    }

    return withdrawal;
  }

  async rejectWithdrawal(
    id: number,
    reason: string,
  ): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现申请不存在');
    }

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.rejectReason = reason;
    withdrawal.reviewedAt = new Date();

    return await this.withdrawalRepository.save(withdrawal);
  }

  async completeWithdrawal(id: number): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
    });

    if (!withdrawal) {
      throw new NotFoundException('提现申请不存在');
    }

    withdrawal.status = WithdrawalStatus.COMPLETED;
    withdrawal.completedAt = new Date();

    return await this.withdrawalRepository.save(withdrawal);
  }
}
