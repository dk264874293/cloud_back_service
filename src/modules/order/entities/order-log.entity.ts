import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@/common/enums/order-status.enum';
import { User } from '@/modules/user/user.entity';

@Entity('order_logs')
export class OrderLog {
  @ApiProperty({ example: 1, description: '日志ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'CONNECTION', description: '订单类型' })
  @Column({ type: 'enum', enum: OrderType })
  orderType!: OrderType;

  @ApiProperty({ example: 1, description: '订单ID' })
  @Column({ type: 'int' })
  orderId!: number;

  @ApiProperty({ example: '创建订单', description: '操作类型' })
  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'operator_id' })
  operator!: User;

  @ApiProperty({ description: '操作人ID', required: false })
  @Column({ type: 'int', name: 'operator_id', nullable: true })
  operatorId!: number;

  @ApiProperty({ example: 'USER', description: '操作人角色' })
  @Column({ type: 'varchar', length: 50 })
  operatorRole!: string;

  @ApiProperty({ example: 'PENDING_ASSIGN', description: '操作前状态', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  beforeStatus!: string;

  @ApiProperty({ example: 'IN_REVIEW', description: '操作后状态', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  afterStatus!: string;

  @ApiProperty({ example: { amount: 10000 }, description: '操作数据', required: false })
  @Column({ type: 'json', nullable: true })
  data!: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;
}
