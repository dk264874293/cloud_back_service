import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ServiceProviderType, ServiceProviderStatus } from '../../service-provider/entities/service-provider.entity';

export class CreateServiceProviderDto {
  @ApiProperty({ example: '某某金融服务有限公司', description: '名称' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '某某金融', description: '简称' })
  @IsString()
  abbreviation!: string;

  @ApiProperty({ example: 'SERVICE_PROVIDER', description: '类型' })
  @IsEnum(ServiceProviderType)
  type!: ServiceProviderType;

  @ApiProperty({ example: '北京市朝阳区', description: '所属区域', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ example: null, description: '上级ID', required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ example: '张三', description: '联系人', required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: '13800138000', description: '联系电话', required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string;
}

export class UpdateServiceProviderDto {
  @ApiProperty({ example: '某某金融服务有限公司', description: '名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '某某金融', description: '简称', required: false })
  @IsString()
  @IsOptional()
  abbreviation?: string;

  @ApiProperty({ example: '北京市朝阳区', description: '所属区域', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ example: null, description: '上级ID', required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ example: '张三', description: '联系人', required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: '13800138000', description: '联系电话', required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ example: 'SUSPENDED', description: '状态', required: false })
  @IsEnum(ServiceProviderStatus)
  @IsOptional()
  status?: ServiceProviderStatus;
}
