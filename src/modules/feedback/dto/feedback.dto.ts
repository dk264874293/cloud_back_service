import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { FeedbackStatus } from '../feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({ example: '系统建议', description: '反馈内容' })
  @IsString()
  content!: string;

  @ApiProperty({ example: ['url1', 'url2'], description: '图片URL列表', required: false })
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class ReplyFeedbackDto {
  @ApiProperty({ example: '已收到', description: '回复内容' })
  @IsString()
  reply!: string;
}

export class UpdateFeedbackStatusDto {
  @ApiProperty({ example: 'RESOLVED', description: '状态' })
  @IsEnum(FeedbackStatus)
  status!: FeedbackStatus;
}
