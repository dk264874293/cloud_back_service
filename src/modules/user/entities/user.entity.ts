import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ServiceProvider } from '../../service-provider/service-provider.entity';
import { Bank } from '../../bank/bank.entity';
import { ConnectionOrder } from '../../order/entities/connection-order.entity';
import { Withdrawal } from '../../withdrawal/withdrawal.entity';
import { Invitation } from '../../invitation/invitation.entity';

export enum UserRole {
  USER = 'USER', // 普通用户
  PROVIDER = 'PROVIDER', // 服务商
  BANK = 'BANK', // 银行客户经理
  ADMIN = 'ADMIN', // 运营管理员
}

export enum VerificationStatus {
  PENDING = 'PENDING', // 待审核
  APPROVED = 'APPROVED', // 已通过
  REJECTED = 'REJECTED', // 已拒绝
}

export enum AccountType {
  ALIPAY = 'ALIPAY', // 支付宝
  WECHAT = 'WECHAT', // 微信
  BANK = 'BANK', // 银行卡
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'json', nullable: true, name: 'provider_permissions' })
  providerPermissions: {
    account_manager: boolean;
    interviewer: boolean;
    handler: boolean;
  };

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
    name: 'verification_status',
  })
  verificationStatus: VerificationStatus;

  @Column({ type: 'json', nullable: true, name: 'verification_data' })
  verificationData: {
    name: string;
    idCard: string;
    documents: string[];
  };

  @Column({ type: 'int', nullable: true, name: 'bank_id' })
  bankId: number;

  @ManyToOne(() => Bank, { nullable: true })
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;

  @Column({ type: 'int', nullable: true, name: 'service_provider_id' })
  serviceProviderId: number;

  @ManyToOne(() => ServiceProvider, { nullable: true })
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date;

  // 关系
  @OneToMany(() => ConnectionOrder, (order) => order.user)
  connectionOrders: ConnectionOrder[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.user)
  withdrawals: Withdrawal[];

  @OneToMany(() => Invitation, (invitation) => invitation.inviter)
  sentInvitations: Invitation[];

  @OneToMany(() => Invitation, (invitation) => invitation.invitee)
  receivedInvitations: Invitation[];
}
