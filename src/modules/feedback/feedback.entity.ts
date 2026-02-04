import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/modules/user/user.entity';

export enum FeedbackStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('feedbacks')
export class Feedback {
  @ApiProperty({ example: 1, description: '反馈ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ example: 1, description: '用户ID' })
  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @ApiProperty({ example: '系统建议', description: '反馈内容' })
  @Column({ type: 'text' })
  content!: string;

  @ApiProperty({ example: ['url1', 'url2'], description: '图片URL列表', required: false })
  @Column({ type: 'json', nullable: true })
  images!: string[];

  @ApiProperty({ example: 'PENDING', description: '状态' })
  @Column({ type: 'enum', enum: FeedbackStatus })
  status!: FeedbackStatus;

  @ApiProperty({ example: '已收到', description: '回复内容', required: false })
  @Column({ type: 'text', nullable: true })
  reply!: string;

  @ApiProperty({ description: '回复时间', required: false })
  @Column({ type: 'timestamp', nullable: true, name: 'replied_at' })
  repliedAt!: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
