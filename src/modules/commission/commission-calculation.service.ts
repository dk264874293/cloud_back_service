import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionRule } from './commission-rule.entity';
import { CommissionRecord, CommissionType } from './commission-record.entity';
import { ConnectionOrder } from '../order/entities/connection-order.entity';
import { EntrustmentOrder } from '../order/entities/entrustment-order.entity';

interface CommissionCalculationParams {
  orderType: string;
  orderId: number;
  orderNo: string;
  orderAmount: number;
  province?: string;
  connectionOrder?: ConnectionOrder;
  entrustmentOrder?: EntrustmentOrder;
}

interface CommissionCalculation {
  recipientId: number;
  recipientRole: string;
  commissionType: CommissionType;
  amount: number;
  rate: number;
}

@Injectable()
export class CommissionCalculationService {
  constructor(
    @InjectRepository(CommissionRule)
    private readonly commissionRuleRepository: Repository<CommissionRule>,
  ) {}

  async calculateCommission(
    params: CommissionCalculationParams,
  ): Promise<CommissionCalculation[]> {
    const rule = await this.getCommissionRule(params.province);

    const commissions: CommissionCalculation[] = [];

    commissions.push({
      recipientId: 0,
      recipientRole: 'PLATFORM',
      commissionType: CommissionType.PLATFORM,
      amount: params.orderAmount * rule.platformRate,
      rate: rule.platformRate,
    });

    commissions.push({
      recipientId: 0,
      recipientRole: 'AGENT',
      commissionType: CommissionType.AGENT,
      amount: params.orderAmount * rule.agentRate,
      rate: rule.agentRate,
    });

    commissions.push({
      recipientId: 0,
      recipientRole: 'FRANCHISE',
      commissionType: CommissionType.FRANCHISE,
      amount: params.orderAmount * rule.franchiseRate,
      rate: rule.franchiseRate,
    });

    commissions.push({
      recipientId: 0,
      recipientRole: 'CHANNEL',
      commissionType: CommissionType.CHANNEL,
      amount: params.orderAmount * rule.channelServiceRate * 0.5,
      rate: rule.channelServiceRate * 0.5,
    });

    commissions.push({
      recipientId: 0,
      recipientRole: 'SERVICE',
      commissionType: CommissionType.SERVICE,
      amount: params.orderAmount * rule.channelServiceRate * 0.5,
      rate: rule.channelServiceRate * 0.5,
    });

    if (params.connectionOrder && params.connectionOrder.developerId) {
      commissions.push({
        recipientId: params.connectionOrder.developerId,
        recipientRole: 'DEVELOPER',
        commissionType: CommissionType.DEVELOPER,
        amount: params.orderAmount * rule.developerRate,
        rate: rule.developerRate,
      });
    }

    if (params.connectionOrder && params.connectionOrder.accountManagerId) {
      commissions.push({
        recipientId: params.connectionOrder.accountManagerId,
        recipientRole: 'ACCOUNT_MANAGER',
        commissionType: CommissionType.ACCOUNT_MANAGER,
        amount: params.orderAmount * rule.accountManagerRate,
        rate: rule.accountManagerRate,
      });
    }

    if (params.connectionOrder && params.connectionOrder.interviewerId) {
      commissions.push({
        recipientId: params.connectionOrder.interviewerId,
        recipientRole: 'INTERVIEWER',
        commissionType: CommissionType.INTERVIEWER,
        amount: params.orderAmount * rule.interviewerRate,
        rate: rule.interviewerRate,
      });
    }

    if (params.entrustmentOrder && params.entrustmentOrder.handlerId) {
      commissions.push({
        recipientId: params.entrustmentOrder.handlerId,
        recipientRole: 'HANDLER',
        commissionType: CommissionType.HANDLER,
        amount: params.orderAmount * rule.handlerRate,
        rate: rule.handlerRate,
      });
    }

    return commissions;
  }

  private async getCommissionRule(province?: string): Promise<CommissionRule> {
    let rule = await this.commissionRuleRepository.findOne({
      where: { province, isActive: true },
    });

    if (!rule) {
      rule = await this.commissionRuleRepository.findOne({
        where: { isActive: true },
      });
    }

    if (!rule) {
      return this.getDefaultRule();
    }

    return rule;
  }

  private getDefaultRule(): CommissionRule {
    const rule = new CommissionRule();
    rule.province = '';
    rule.platformRate = 0.3;
    rule.agentRate = 0.07;
    rule.franchiseRate = 0.063;
    rule.channelServiceRate = 0.05103;
    rule.developerRate = 0.051597;
    rule.accountManagerRate = 0.06;
    rule.interviewerRate = 0.02;
    rule.handlerRate = 0.02;
    rule.isActive = true;
    return rule;
  }
}
