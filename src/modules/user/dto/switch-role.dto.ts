import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

export class SwitchRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.PROVIDER, description: '切换到角色' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
