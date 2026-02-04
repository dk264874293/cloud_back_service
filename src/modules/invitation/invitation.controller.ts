import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseDto } from '@/common/dto/response.dto';
import { InvitationService } from './invitation.service';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('invitation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('create')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '创建邀请码' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createInvitation(
    @CurrentUser('id') userId: number,
  ): Promise<ResponseDto> {
    const invitation = await this.invitationService.createInvitation(userId);
    return {
      code: 0,
      message: '创建成功',
      data: invitation,
    };
  }

  @Post('accept')
  @ApiOperation({ summary: '接受邀请' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async acceptInvitation(
    @CurrentUser('id') userId: number,
    @Body('invitationCode') invitationCode: string,
  ): Promise<ResponseDto> {
    const invitation = await this.invitationService.acceptInvitation(
      userId,
      invitationCode,
    );
    return {
      code: 0,
      message: '接受成功',
      data: invitation,
    };
  }

  @Get('my')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '获取我的邀请列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getMyInvitations(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.invitationService.getInvitationsByInviter(
      userId,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Get(':code')
  @ApiOperation({ summary: '通过邀请码获取邀请信息' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getInvitationByCode(
    @Param('code') invitationCode: string,
  ): Promise<ResponseDto> {
    const invitation = await this.invitationService.getInvitationByCode(
      invitationCode,
    );
    return {
      code: 0,
      message: '获取成功',
      data: invitation,
    };
  }
}
