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
import { ConnectionOrder } from './connection-order.entity';
import { User } from '@/modules/user/user.entity';
import { EntrustmentOrderStatus } from '@/common/enums/order-status.enum';

@Entity('entrustment_orders')
export class EntrustmentOrder {
  @ApiProperty({ example: 1, description: '订单ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'ET2026020200001', description: '订单号' })
  @Column({ type: 'varchar', length: 32, unique: true })
  order_no!: string;

  @ManyToOne(() => ConnectionOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connection_order_id' })
  connectionOrder!: ConnectionOrder;

  @ApiProperty({ description: '关联对接订单ID', required: false })
  @Column({ type: 'int', name: 'connection_order_id' })
  connectionOrderId!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ description: '用户ID', required: false })
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'account_manager_id' })
  accountManager!: User;

  @ApiProperty({ description: '管户人ID', required: false })
  @Column({ type: 'int', name: 'account_manager_id', nullable: true })
  accountManagerId!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'handler_id' })
  handler!: User;

  @ApiProperty({ description: '业务受理人ID', required: false })
  @Column({ type: 'int', name: 'handler_id', nullable: true })
  handlerId!: number;

  @ApiProperty({
    enum: EntrustmentOrderStatus,
    example: EntrustmentOrderStatus.PENDING_REVIEW,
    description: '订单状态',
  })
  @Column({ type: 'enum', enum: EntrustmentOrderStatus })
  status!: EntrustmentOrderStatus;

  @ApiProperty({ example: 'https://example.com/agreement.pdf', description: '协议URL', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  agreementUrl!: string;

  @ApiProperty({ example: '审核通过', description: '审核备注', required: false })
  @Column({ type: 'text', nullable: true })
  approvalNote!: string;

  @ApiProperty({ example: '材料不完整', description: '拒绝原因', required: false })
  @Column({ type: 'text', nullable: true })
  rejectReason!: string;

  @ApiProperty({ example: '已完成', description: '完成备注', required: false })
  @Column({ type: 'text', nullable: true })
  completionNote!: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
