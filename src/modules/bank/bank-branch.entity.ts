import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Bank } from './bank.entity';

@Entity('bank_branches')
export class BankBranch {
  @ApiProperty({ example: 1, description: '分行ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Bank)
  @JoinColumn({ name: 'bank_id' })
  bank!: Bank;

  @ApiProperty({ example: 1, description: '银行ID' })
  @Column({ type: 'int', name: 'bank_id' })
  bankId!: number;

  @ApiProperty({ example: '北京分行', description: '分行名称' })
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @ApiProperty({ example: '北京市', description: '省份' })
  @Column({ type: 'varchar', length: 50 })
  province!: string;

  @ApiProperty({ example: '北京市', description: '城市' })
  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @ApiProperty({ example: '朝阳区建国路88号', description: '地址' })
  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
