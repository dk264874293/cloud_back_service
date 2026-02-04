import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('commission_rules')
export class CommissionRule {
  @ApiProperty({ example: 1, description: '规则ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: '北京市', description: '省份（空表示全国默认规则）' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  province!: string;

  @ApiProperty({ example: 0.30, description: '平台抽成比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'platform_rate' })
  platformRate!: number;

  @ApiProperty({ example: 0.07, description: '代理商比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'agent_rate' })
  agentRate!: number;

  @ApiProperty({ example: 0.063, description: '加盟商比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'franchise_rate' })
  franchiseRate!: number;

  @ApiProperty({ example: 0.05103, description: '渠道商+服务商比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'channel_service_rate' })
  channelServiceRate!: number;

  @ApiProperty({ example: 0.051597, description: '开发人比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'developer_rate' })
  developerRate!: number;

  @ApiProperty({ example: 0.06, description: '管户人比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'account_manager_rate' })
  accountManagerRate!: number;

  @ApiProperty({ example: 0.02, description: '访谈人比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'interviewer_rate' })
  interviewerRate!: number;

  @ApiProperty({ example: 0.02, description: '业务受理人比例' })
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'handler_rate' })
  handlerRate!: number;

  @ApiProperty({ example: true, description: '是否生效' })
  @Column({ type: 'boolean', name: 'is_active' })
  isActive!: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
