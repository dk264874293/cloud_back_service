import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { VerifyRoleDto } from './dto/verify-role.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取个人信息' })
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新个人信息' })
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }

  @Post('switch-role')
  @ApiOperation({ summary: '切换角色' })
  async switchRole(@CurrentUser() user: any, @Body() switchRoleDto: SwitchRoleDto) {
    return this.userService.switchRole(user.id, switchRoleDto);
  }

  @Post('verify')
  @ApiOperation({ summary: '提交认证材料' })
  async verifyRole(@CurrentUser() user: any, @Body() verifyRoleDto: VerifyRoleDto) {
    return this.userService.verifyRole(user.id, verifyRoleDto);
  }
}
