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

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}

@Entity('invitations')
export class Invitation {
  @ApiProperty({ example: 1, description: '邀请ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  inviter!: User;

  @ApiProperty({ example: 1, description: '邀请人ID' })
  @Column({ type: 'int', name: 'inviter_id' })
  inviterId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitee_id' })
  invitee!: User;

  @ApiProperty({ example: 2, description: '被邀请人ID', required: false })
  @Column({ type: 'int', name: 'invitee_id', nullable: true })
  inviteeId!: number;

  @ApiProperty({ example: 'ABC123', description: '邀请码' })
  @Column({ type: 'varchar', length: 32, unique: true })
  invitationCode!: string;

  @ApiProperty({ example: 'PENDING', description: '状态' })
  @Column({ type: 'enum', enum: InvitationStatus })
  status!: InvitationStatus;

  @ApiProperty({ example: 1000.00, description: '累计佣金' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  commissionAmount!: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
