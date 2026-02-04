import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';

export enum ServiceProviderType {
  FRANCHISE = 'FRANCHISE', // 加盟商（层级 0，根节点）
  CHANNEL = 'CHANNEL', // 渠道商（层级 1，加盟商的子节点）
  SERVICE_PROVIDER = 'SERVICE_PROVIDER', // 服务商（层级 2，渠道商的子节点）
}

export enum ServiceProviderStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('service_providers')
@Index('idx_parent_id', ['parentId'])
@Index('idx_path', ['path'])
@Index('idx_root_id', ['rootId'])
@Index('idx_type_parent', ['type', 'parentId'])
export class ServiceProvider {
  @ApiProperty({ example: 1, description: '服务商ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: '某某金融服务有限公司', description: '名称' })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ApiProperty({ example: '某某金融', description: '简称' })
  @Column({ type: 'varchar', length: 50 })
  abbreviation!: string;

  @ApiProperty({
    example: 'FRANCHISE',
    enum: ServiceProviderType,
    description: '类型（FRANCHISE加盟商→CHANNEL渠道商→SERVICE_PROVIDER服务商）',
  })
  @Column({ type: 'enum', enum: ServiceProviderType })
  type!: ServiceProviderType;

  @ApiProperty({
    example: '北京市朝阳区',
    description: '所属区域',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  region!: string;

  @ApiProperty({ example: null, description: '上级ID', required: false })
  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  parentId!: number;

  @ManyToOne(() => ServiceProvider, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: ServiceProvider;

  @OneToMany(() => ServiceProvider, (sp) => sp.parent)
  children: ServiceProvider[];

  @ApiProperty({
    example: 0,
    description: '层级深度（0=加盟商, 1=渠道商, 2=服务商）',
  })
  @Column({ type: 'int', default: 0, name: 'level' })
  level: number;

  @ApiProperty({
    example: '1/3/7',
    description: '物化路径（如"1/3/7"表示节点路径）',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'path' })
  path: string;

  @ApiProperty({
    example: 1,
    description: '根节点ID（用于快速查询同一棵树）',
    required: false,
  })
  @Column({ type: 'int', nullable: true, name: 'root_id' })
  rootId: number;

  @ApiProperty({ example: '张三', description: '联系人' })
  @Column({ type: 'varchar', length: 50, name: 'contact_person' })
  contactPerson!: string;

  @ApiProperty({ example: '13800138000', description: '联系电话' })
  @Column({ type: 'varchar', length: 20, name: 'contact_phone' })
  contactPhone!: string;

  @ApiProperty({ example: 'ACTIVE', description: '状态' })
  @Column({
    type: 'enum',
    enum: ServiceProviderStatus,
    default: ServiceProviderStatus.ACTIVE,
  })
  status: ServiceProviderStatus;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({ description: '删除时间（软删除）', required: false })
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date;

  // 关系
  @OneToMany(() => User, (user) => user.serviceProvider)
  users: User[];
}
