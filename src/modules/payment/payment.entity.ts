import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@/common/enums/order-status.enum';
import { User } from '@/modules/user/user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum PaymentType {
  JSAPI = 'JSAPI',
  NATIVE = 'NATIVE',
}

@Entity('payments')
export class Payment {
  @ApiProperty({ example: 1, description: '支付ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'PAY2026020200001', description: '支付单号' })
  @Column({ type: 'varchar', length: 32, unique: true, name: 'payment_no' })
  paymentNo!: string;

  @ApiProperty({ example: 'CONNECTION', description: '订单类型' })
  @Column({ type: 'enum', enum: OrderType })
  orderType!: OrderType;

  @ApiProperty({ example: 123, description: '订单ID' })
  @Column({ type: 'int', name: 'order_id' })
  orderId!: number;

  @ApiProperty({ example: 'CO2026020200001', description: '订单号' })
  @Column({ type: 'varchar', length: 32, name: 'order_no' })
  orderNo!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payer_id' })
  payer!: User;

  @ApiProperty({ description: '支付人ID', required: false })
  @Column({ type: 'int', name: 'payer_id', nullable: true })
  payerId!: number;

  @ApiProperty({ example: 5000.00, description: '支付金额' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @ApiProperty({ example: 'JSAPI', description: '支付方式' })
  @Column({ type: 'enum', enum: PaymentType, name: 'payment_type' })
  paymentType!: PaymentType;

  @ApiProperty({ example: '4200001234567890', description: '微信交易号', required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  transactionId!: string;

  @ApiProperty({ example: 'PAID', description: '支付状态' })
  @Column({ type: 'enum', enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty({ description: '支付时间', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt!: Date;

  @ApiProperty({ example: { notify: 'data' }, description: '回调数据', required: false })
  @Column({ type: 'json', nullable: true })
  callbackData!: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
