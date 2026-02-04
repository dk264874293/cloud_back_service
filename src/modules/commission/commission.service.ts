import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionRecord, CommissionStatus } from './commission-record.entity';
import { CommissionRule } from './commission-rule.entity';
import { CommissionCalculationService } from './commission-calculation.service';
import { OrderType } from '@/common/enums/order-status.enum';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(CommissionRecord)
    private readonly commissionRecordRepository: Repository<CommissionRecord>,
    @InjectRepository(CommissionRule)
    private readonly commissionRuleRepository: Repository<CommissionRule>,
    private readonly commissionCalculationService: CommissionCalculationService,
  ) {}

  async createCommissionRecords(
    orderType: OrderType,
    orderId: number,
    orderNo: string,
    orderAmount: number,
    connectionOrder?: any,
    entrustmentOrder?: any,
    province?: string,
  ): Promise<CommissionRecord[]> {
    const calculations = await this.commissionCalculationService.calculateCommission({
      orderType,
      orderId,
      orderNo,
      orderAmount,
      province,
      connectionOrder,
      entrustmentOrder,
    });

    const records: CommissionRecord[] = [];

    for (const calc of calculations) {
      if (calc.recipientId === 0) {
        continue;
      }

      const record = new CommissionRecord();
      record.orderType = orderType;
      record.orderId = orderId;
      record.orderNo = orderNo;
      record.orderAmount = orderAmount;
      record.commissionType = calc.commissionType;
      record.recipientId = calc.recipientId;
      record.recipientRole = calc.recipientRole;
      record.amount = calc.amount;
      record.rate = calc.rate;
      record.status = CommissionStatus.PENDING;

      records.push(record);
    }

    return await this.commissionRecordRepository.save(records);
  }

  async getCommissionRecords(
    userId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ records: CommissionRecord[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const whereClause = userId ? { recipientId: userId } : {};

    const [records, total] = await this.commissionRecordRepository.findAndCount({
      where: whereClause,
      relations: ['recipient'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { records, total, page, limit };
  }

  async payCommission(commissionId: number): Promise<CommissionRecord> {
    const record = await this.commissionRecordRepository.findOne({
      where: { id: commissionId },
    });

    if (!record) {
      throw new NotFoundException('分佣记录不存在');
    }

    if (record.status !== CommissionStatus.PENDING) {
      throw new Error('只能支付待结算的佣金');
    }

    record.status = CommissionStatus.PAID;
    record.paidAt = new Date();

    return await this.commissionRecordRepository.save(record);
  }

  async getCommissionRules(): Promise<CommissionRule[]> {
    return await this.commissionRuleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createCommissionRule(
    data: Partial<CommissionRule>,
  ): Promise<CommissionRule> {
    const rule = new CommissionRule();
    rule.province = data.province || '';
    rule.platformRate = data.platformRate ?? 0;
    rule.agentRate = data.agentRate ?? 0;
    rule.franchiseRate = data.franchiseRate ?? 0;
    rule.channelServiceRate = data.channelServiceRate ?? 0;
    rule.developerRate = data.developerRate ?? 0;
    rule.accountManagerRate = data.accountManagerRate ?? 0;
    rule.interviewerRate = data.interviewerRate ?? 0;
    rule.handlerRate = data.handlerRate ?? 0;
    rule.isActive = true;

    return await this.commissionRuleRepository.save(rule);
  }

  async updateCommissionRule(
    id: number,
    data: Partial<CommissionRule>,
  ): Promise<CommissionRule> {
    const rule = await this.commissionRuleRepository.findOne({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('分佣规则不存在');
    }

    const updatedRule: any = { ...rule };

    if (data.province !== undefined) updatedRule.province = data.province;
    if (data.platformRate !== undefined && data.platformRate !== null) updatedRule.platformRate = data.platformRate;
    if (data.agentRate !== undefined && data.agentRate !== null) updatedRule.agentRate = data.agentRate;
    if (data.franchiseRate !== undefined && data.franchiseRate !== null) updatedRule.franchiseRate = data.franchiseRate;
    if (data.channelServiceRate !== undefined && data.channelServiceRate !== null) updatedRule.channelServiceRate = data.channelServiceRate;
    if (data.developerRate !== undefined && data.developerRate !== null) updatedRule.developerRate = data.developerRate;
    if (data.accountManagerRate !== undefined && data.accountManagerRate !== null) updatedRule.accountManagerRate = data.accountManagerRate;
    if (data.interviewerRate !== undefined && data.interviewerRate !== null) updatedRule.interviewerRate = data.interviewerRate;
    if (data.handlerRate !== undefined && data.handlerRate !== null) updatedRule.handlerRate = data.handlerRate;
    if (data.isActive !== undefined) updatedRule.isActive = data.isActive;

    return await this.commissionRuleRepository.save(updatedRule as CommissionRule);
  }

  async deleteCommissionRule(id: number): Promise<void> {
    await this.commissionRuleRepository.delete(id);
  }
}
