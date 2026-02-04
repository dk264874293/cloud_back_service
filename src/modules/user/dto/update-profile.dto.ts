import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: '张三', description: '昵称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: '头像URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
}
