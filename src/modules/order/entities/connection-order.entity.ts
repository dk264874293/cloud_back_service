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
import { User } from '@/modules/user/user.entity';
import { ConnectionOrderStatus } from '@/common/enums/order-status.enum';

@Entity('connection_orders')
export class ConnectionOrder {
  @ApiProperty({ example: 1, description: '订单ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'CO2026020200001', description: '订单号' })
  @Column({ type: 'varchar', length: 32, unique: true })
  order_no!: string;

  @ApiProperty({ example: 1, description: '用户ID' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ description: '用户ID', required: false })
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId!: number;

  @ApiProperty({ example: 2, description: '开发人ID', required: false })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'developer_id' })
  developer!: User;

  @ApiProperty({ description: '开发人ID', required: false })
  @Column({ type: 'int', name: 'developer_id', nullable: true })
  developerId!: number;

  @ApiProperty({ example: 3, description: '管户人ID', required: false })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'account_manager_id' })
  accountManager!: User;

  @ApiProperty({ description: '管户人ID', required: false })
  @Column({ type: 'int', name: 'account_manager_id', nullable: true })
  accountManagerId!: number;

  @ApiProperty({ example: 4, description: '访谈人ID', required: false })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'interviewer_id' })
  interviewer!: User;

  @ApiProperty({ description: '访谈人ID', required: false })
  @Column({ type: 'int', name: 'interviewer_id', nullable: true })
  interviewerId!: number;

  @ApiProperty({
    enum: ConnectionOrderStatus,
    example: ConnectionOrderStatus.PENDING_ASSIGN,
    description: '订单状态',
  })
  @Column({ type: 'enum', enum: ConnectionOrderStatus })
  status!: ConnectionOrderStatus;

  @ApiProperty({ example: 'INDIVIDUAL', description: '用户类型' })
  @Column({ type: 'enum', enum: ['INDIVIDUAL', 'ENTERPRISE'] })
  userType!: string;

  @ApiProperty({ example: 'LOAN', description: '需求类型' })
  @Column({ type: 'enum', enum: ['LOAN', 'DEPOSIT', 'FINANCIAL_MANAGEMENT'] })
  needType!: string;

  @ApiProperty({ example: '北京市朝阳区', description: '位置' })
  @Column({ type: 'varchar', length: 500 })
  location!: string;

  @ApiProperty({ example: 1000000, description: '需求金额' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @ApiProperty({ example: '月收入3万元', description: '还款能力描述' })
  @Column({ type: 'text', nullable: true })
  repaymentAbility!: string;

  @ApiProperty({ example: 'https://example.com/report.pdf', description: '客户需求报告URL', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  reportUrl!: string;

  @ApiProperty({ example: 5000, description: '订单价格', required: false })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  price!: number;

  @ApiProperty({ example: [1, 2, 3], description: '派单银行ID列表', required: false })
  @Column({ type: 'json', nullable: true })
  assignedBanks!: number[];

  @ApiProperty({ example: [1, 2], description: '已购买的银行ID列表', required: false })
  @Column({ type: 'json', nullable: true })
  purchasedByBanks!: number[];

  @ApiProperty({ example: 1, description: '用户选择的银行ID', required: false })
  @Column({ type: 'int', nullable: true })
  selectedBankId!: number;

  @ApiProperty({ example: true, description: '是否现场确认', required: false })
  @Column({ type: 'boolean', default: false })
  isConfirmed!: boolean;

  @ApiProperty({ description: '确认时间', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'confirmed_at' })
  confirmedAt!: Date;

  @ApiProperty({ example: '用户取消', description: '取消原因', required: false })
  @Column({ type: 'text', nullable: true })
  cancelReason!: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
