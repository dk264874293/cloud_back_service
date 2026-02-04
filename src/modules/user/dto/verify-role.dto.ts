import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

export class VerifyRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.PROVIDER, description: '认证角色' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;

  @ApiProperty({ example: '张三', description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '110101199001011234', description: '身份证号', required: false })
  @IsString()
  id_card?: string;

  @ApiProperty({ example: ['url1', 'url2'], description: '认证材料URL列表' })
  @IsArray()
  @IsNotEmpty()
  documents!: string[];
}
