import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './bank.entity';
import { BankBranch } from './bank-branch.entity';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(BankBranch)
    private readonly bankBranchRepository: Repository<BankBranch>,
  ) {}

  async getBanks(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    banks: Bank[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [banks, total] = await this.bankRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { banks, total, page, limit };
  }

  async getBankBranches(
    bankId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    branches: BankBranch[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const where = bankId ? { bankId } : {};

    const [branches, total] = await this.bankBranchRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { branches, total, page, limit };
  }

  async createBank(name: string, code: string): Promise<Bank> {
    const bank = new Bank();
    bank.name = name;
    bank.code = code;

    return await this.bankRepository.save(bank);
  }

  async createBankBranch(
    bankId: number,
    name: string,
    province: string,
    city: string,
    address: string,
  ): Promise<BankBranch> {
    const branch = new BankBranch();
    branch.bankId = bankId;
    branch.name = name;
    branch.province = province;
    branch.city = city;
    branch.address = address;

    return await this.bankBranchRepository.save(branch);
  }

  async deleteBank(id: number): Promise<void> {
    await this.bankRepository.delete(id);
  }

  async deleteBankBranch(id: number): Promise<void> {
    await this.bankBranchRepository.delete(id);
  }
}
