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

@Entity('files')
export class File {
  @ApiProperty({ example: 1, description: '文件ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'file-uuid', description: '文件唯一标识' })
  @Column({ type: 'varchar', length: 64, unique: true })
  uuid!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy!: User;

  @ApiProperty({ description: '上传人ID', required: false })
  @Column({ type: 'int', name: 'uploaded_by', nullable: true })
  uploadedById!: number;

  @ApiProperty({ example: 'report.pdf', description: '原始文件名' })
  @Column({ type: 'varchar', length: 255 })
  originalName!: string;

  @ApiProperty({ example: 'pdf', description: '文件类型' })
  @Column({ type: 'varchar', length: 50 })
  mimeType!: string;

  @ApiProperty({ example: 'https://oss.example.com/file-uuid.pdf', description: '文件URL' })
  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @ApiProperty({ example: 'path/to/file-uuid.pdf', description: '文件路径' })
  @Column({ type: 'varchar', length: 500 })
  path!: string;

  @ApiProperty({ example: 1024000, description: '文件大小（字节）' })
  @Column({ type: 'bigint' })
  size!: number;

  @ApiProperty({ example: 'customer_report', description: '文件分类', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  category!: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
