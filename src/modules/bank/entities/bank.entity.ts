import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BankBranch } from './bank-branch.entity';

@Entity('banks')
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // 关系
  @OneToMany(() => User, (user) => user.bank)
  users: User[];

  @OneToMany(() => BankBranch, (branch) => branch.bank)
  branches: BankBranch[];
}
