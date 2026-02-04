import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum AccountType {
  BANK_CARD = 'BANK_CARD',
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
}

@Entity('withdrawals')
export class Withdrawal {
  @ApiProperty({ example: 1, description: '提现ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'WIT2026020200001', description: '提现单号' })
  @Column({ type: 'varchar', length: 32, unique: true, name: 'withdrawal_no' })
  withdrawalNo!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ example: 1, description: '用户ID' })
  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @ApiProperty({ example: 5000.00, description: '提现金额' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @ApiProperty({ example: 'BANK_CARD', description: '账户类型' })
  @Column({ type: 'enum', enum: AccountType, name: 'account_type' })
  accountType!: AccountType;

  @ApiProperty({ example: { bankName: '工商银行', accountNo: '6222021234567890' }, description: '账户信息' })
  @Column({ type: 'json', name: 'account_info' })
  accountInfo!: Record<string, any>;

  @ApiProperty({ example: 'PENDING', description: '状态' })
  @Column({ type: 'enum', enum: WithdrawalStatus })
  status!: WithdrawalStatus;

  @ApiProperty({ example: '审核通过', description: '审核备注', required: false })
  @Column({ type: 'text', nullable: true, name: 'review_note' })
  reviewNote!: string;

  @ApiProperty({ example: '', description: '拒绝原因', required: false })
  @Column({ type: 'text', nullable: true, name: 'reject_reason' })
  rejectReason!: string;

  @ApiProperty({ description: '审核时间', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'reviewed_at' })
  reviewedAt!: Date;

  @ApiProperty({ description: '完成时间', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt!: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
