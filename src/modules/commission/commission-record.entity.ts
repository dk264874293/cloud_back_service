import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@/common/enums/order-status.enum';
import { User } from '@/modules/user/user.entity';

export enum CommissionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum CommissionType {
  PLATFORM = 'PLATFORM',
  AGENT = 'AGENT',
  FRANCHISE = 'FRANCHISE',
  CHANNEL = 'CHANNEL',
  SERVICE = 'SERVICE',
  DEVELOPER = 'DEVELOPER',
  ACCOUNT_MANAGER = 'ACCOUNT_MANAGER',
  INTERVIEWER = 'INTERVIEWER',
  HANDLER = 'HANDLER',
}

@Entity('commission_records')
export class CommissionRecord {
  @ApiProperty({ example: 1, description: '分佣记录ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'CONNECTION', description: '订单类型' })
  @Column({ type: 'enum', enum: OrderType, name: 'order_type' })
  orderType!: OrderType;

  @ApiProperty({ example: 123, description: '订单ID' })
  @Column({ type: 'int', name: 'order_id' })
  orderId!: number;

  @ApiProperty({ example: 'CO2026020200001', description: '订单号' })
  @Column({ type: 'varchar', length: 32, name: 'order_no' })
  orderNo!: string;

  @ApiProperty({ example: 5000.00, description: '订单总额' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'order_amount' })
  orderAmount!: number;

  @ApiProperty({ example: 'DEVELOPER', description: '分佣类型' })
  @Column({ type: 'enum', enum: CommissionType, name: 'commission_type' })
  commissionType!: CommissionType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient!: User;

  @ApiProperty({ example: 1, description: '收佣人ID' })
  @Column({ type: 'int', name: 'recipient_id' })
  recipientId!: number;

  @ApiProperty({ example: 'PROVIDER', description: '收佣人角色' })
  @Column({ type: 'varchar', length: 50, name: 'recipient_role' })
  recipientRole!: string;

  @ApiProperty({ example: 250.00, description: '分佣金额' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @ApiProperty({ example: 0.05, description: '分佣比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  rate!: number;

  @ApiProperty({ example: 'PENDING', description: '状态' })
  @Column({ type: 'enum', enum: CommissionStatus })
  status!: CommissionStatus;

  @ApiProperty({ description: '支付时间', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt!: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
