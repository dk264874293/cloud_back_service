import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';
import { ProviderPermission } from '../../common/enums/provider-permission.enum';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: '用户ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: '13800138000', description: '手机号' })
  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @ApiProperty({ description: '密码哈希', required: false })
  @Column({ type: 'varchar', length: 255, select: false })
  password_hash!: string;

  @ApiProperty({ example: '张三', description: '昵称' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: '头像URL', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar!: string;

  @ApiProperty({ enum: UserRole, description: '用户角色' })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @ApiProperty({
    example: [ProviderPermission.ACCOUNT_MANAGER],
    description: '服务商权限',
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  provider_permissions!: ProviderPermission[];

  @ApiProperty({ example: true, description: '是否已认证' })
  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @ApiProperty({ description: '认证状态', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  verification_status!: string;

  @ApiProperty({ description: '认证材料数据', required: false })
  @Column({ type: 'json', nullable: true })
  verification_data!: Record<string, any>;

  @ApiProperty({ example: 1, description: '关联银行ID', required: false })
  @Column({ type: 'int', nullable: true })
  bank_id!: number;

  @ApiProperty({ example: 1, description: '关联服务商ID', required: false })
  @Column({ type: 'int', nullable: true })
  service_provider_id!: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at!: Date;
}
