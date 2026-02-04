import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, ReplyFeedbackDto, UpdateFeedbackStatusDto } from './dto/feedback.dto';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '提交反馈' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createFeedback(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateFeedbackDto,
  ): Promise<ResponseDto> {
    const feedback = await this.feedbackService.createFeedback(
      userId,
      dto.content,
      dto.images,
    );
    return {
      code: 0,
      message: '提交成功',
      data: feedback,
    };
  }

  @Get('my')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '获取我的反馈列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getMyFeedbacks(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.feedbackService.getFeedbacksByUser(
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

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有反馈列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getAllFeedbacks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.feedbackService.getAllFeedbacks(
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Put(':id/reply')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '回复反馈' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async replyFeedback(
    @Param('id') feedbackId: number,
    @Body() dto: ReplyFeedbackDto,
  ): Promise<ResponseDto> {
    const feedback = await this.feedbackService.replyFeedback(
      feedbackId,
      dto.reply,
    );
    return {
      code: 0,
      message: '回复成功',
      data: feedback,
    };
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新反馈状态' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async updateFeedbackStatus(
    @Param('id') feedbackId: number,
    @Body() dto: UpdateFeedbackStatusDto,
  ): Promise<ResponseDto> {
    const feedback = await this.feedbackService.updateFeedbackStatus(
      feedbackId,
      dto.status,
    );
    return {
      code: 0,
      message: '更新成功',
      data: feedback,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除反馈' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteFeedback(@Param('id') feedbackId: number): Promise<ResponseDto> {
    await this.feedbackService.deleteFeedback(feedbackId);
    return {
      code: 0,
      message: '删除成功',
    };
  }
}
