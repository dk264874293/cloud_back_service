import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCommissionRuleDto {
  @ApiProperty({ example: '北京市', description: '省份', required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ example: 0.30, description: '平台抽成比例' })
  @IsNumber()
  platformRate!: number;

  @ApiProperty({ example: 0.07, description: '代理商比例' })
  @IsNumber()
  agentRate!: number;

  @ApiProperty({ example: 0.063, description: '加盟商比例' })
  @IsNumber()
  franchiseRate!: number;

  @ApiProperty({ example: 0.05103, description: '渠道商+服务商比例' })
  @IsNumber()
  channelServiceRate!: number;

  @ApiProperty({ example: 0.051597, description: '开发人比例' })
  @IsNumber()
  developerRate!: number;

  @ApiProperty({ example: 0.06, description: '管户人比例' })
  @IsNumber()
  accountManagerRate!: number;

  @ApiProperty({ example: 0.02, description: '访谈人比例' })
  @IsNumber()
  interviewerRate!: number;

  @ApiProperty({ example: 0.02, description: '业务受理人比例' })
  @IsNumber()
  handlerRate!: number;
}

export class UpdateCommissionRuleDto {
  @ApiProperty({ example: '北京市', description: '省份', required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ example: 0.30, description: '平台抽成比例', required: false })
  @IsNumber()
  @IsOptional()
  platformRate?: number;

  @ApiProperty({ example: 0.07, description: '代理商比例', required: false })
  @IsNumber()
  @IsOptional()
  agentRate?: number;

  @ApiProperty({ example: 0.063, description: '加盟商比例', required: false })
  @IsNumber()
  @IsOptional()
  franchiseRate?: number;

  @ApiProperty({ example: 0.05103, description: '渠道商+服务商比例', required: false })
  @IsNumber()
  @IsOptional()
  channelServiceRate?: number;

  @ApiProperty({ example: 0.051597, description: '开发人比例', required: false })
  @IsNumber()
  @IsOptional()
  developerRate?: number;

  @ApiProperty({ example: 0.06, description: '管户人比例', required: false })
  @IsNumber()
  @IsOptional()
  accountManagerRate?: number;

  @ApiProperty({ example: 0.02, description: '访谈人比例', required: false })
  @IsNumber()
  @IsOptional()
  interviewerRate?: number;

  @ApiProperty({ example: 0.02, description: '业务受理人比例', required: false })
  @IsNumber()
  @IsOptional()
  handlerRate?: number;

  @ApiProperty({ example: true, description: '是否生效', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
