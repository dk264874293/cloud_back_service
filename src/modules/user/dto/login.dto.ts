import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'password123', description: '密码' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
