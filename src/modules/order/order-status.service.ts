import { Injectable } from '@nestjs/common';
import { ConnectionOrderStatus, EntrustmentOrderStatus } from '@/common/enums/order-status.enum';

@Injectable()
export class OrderStateMachine {
  readonly CONNECTION_TRANSITIONS: Record<string, string[]> = {
    PENDING_ASSIGN: ['IN_REVIEW'],
    IN_REVIEW: ['WAITING_PURCHASE'],
    WAITING_PURCHASE: ['IN_OFFLINE'],
    IN_OFFLINE: ['CONFIRMED', 'CANCELLED', 'FAILED'],
    CONFIRMED: [],
    CANCELLED: [],
    FAILED: [],
  };

  readonly ENTUSTMENT_TRANSITIONS: Record<string, string[]> = {
    PENDING_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['PROCESSING'],
    PROCESSING: ['COMPLETED', 'FAILED'],
    REJECTED: [],
    COMPLETED: [],
    FAILED: [],
  };

  canTransitionConnection(currentStatus: string, newStatus: string): boolean {
    const validTransitions = this.CONNECTION_TRANSITIONS[currentStatus] || [];
    return validTransitions.includes(newStatus);
  }

  canTransitionEntrustment(currentStatus: string, newStatus: string): boolean {
    const validTransitions = this.ENTUSTMENT_TRANSITIONS[currentStatus] || [];
    return validTransitions.includes(newStatus);
  }

  isConnectionCancelable(status: string): boolean {
    return status === 'PENDING_ASSIGN' || status === 'IN_REVIEW' || status === 'WAITING_PURCHASE';
  }

  isConnectionBankPurchasable(status: string): boolean {
    return status === 'WAITING_PURCHASE';
  }

  isEntrustmentCancelable(status: string): boolean {
    return status === 'PENDING_REVIEW';
  }
}
