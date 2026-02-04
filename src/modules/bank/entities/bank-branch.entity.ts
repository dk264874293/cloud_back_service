import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bank } from './bank.entity';

@Entity('bank_branches')
export class BankBranch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'bank_id' })
  bankId: number;

  @ManyToOne(() => Bank, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  province: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
