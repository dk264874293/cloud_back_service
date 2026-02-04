import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('banks')
export class Bank {
  @ApiProperty({ example: 1, description: '银行ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: '中国工商银行', description: '银行名称' })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @ApiProperty({ example: 'ICBC', description: '银行代码' })
  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
