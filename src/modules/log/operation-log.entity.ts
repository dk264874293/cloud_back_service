import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('operation_logs')
export class OperationLog {
  @ApiProperty({ example: 1, description: '日志ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 1, description: '用户ID', required: false })
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId!: number;

  @ApiProperty({ example: 'order', description: '模块' })
  @Column({ type: 'varchar', length: 50 })
  module!: string;

  @ApiProperty({ example: 'create', description: '操作' })
  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @ApiProperty({ example: '192.168.1.1', description: 'IP地址', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ip!: string;

  @ApiProperty({ example: 'Mozilla/5.0', description: '用户代理', required: false })
  @Column({ type: 'text', nullable: true })
  userAgent!: string;

  @ApiProperty({ example: '{"userId": 1}', description: '请求数据', required: false })
  @Column({ type: 'json', nullable: true, name: 'request_data' })
  requestData!: Record<string, any>;

  @ApiProperty({ example: '{"success": true}', description: '响应数据', required: false })
  @Column({ type: 'json', nullable: true, name: 'response_data' })
  responseData!: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
