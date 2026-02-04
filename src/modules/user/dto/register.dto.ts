import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone!: string;

  @ApiProperty({ example: 'password123', description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: '密码不能少于6位' })
  @MaxLength(20, { message: '密码不能超过20位' })
  password!: string;

  @ApiProperty({ example: '123456', description: '验证码' })
  @IsString()
  @IsNotEmpty()
  verification_code!: string;

  @ApiProperty({ example: 'ABC123', description: '邀请码', required: false })
  @IsString()
  invitation_code?: string;
}
