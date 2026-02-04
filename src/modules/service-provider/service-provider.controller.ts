import {
  Controller,
  Get,
  Post,
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
import { ResponseDto } from '@/common/dto/response.dto';
import { ServiceProviderService } from './service-provider.service';
import {
  CreateServiceProviderDto,
  UpdateServiceProviderDto,
} from './dto/service-provider.dto';
import { UserRole } from '@/common/enums/user-role.enum';
import { ServiceProviderType } from './entities/service-provider.entity';

@ApiTags('service-provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/service-providers')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取服务商列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getServiceProviders(
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.serviceProviderService.getServiceProviders(
      type as ServiceProviderType | undefined,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取服务商详情' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getServiceProvider(@Param('id') id: number): Promise<ResponseDto> {
    const serviceProvider =
      await this.serviceProviderService.getServiceProviderById(id);
    return {
      code: 0,
      message: '获取成功',
      data: serviceProvider,
    };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建服务商' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createServiceProvider(
    @Body() dto: CreateServiceProviderDto,
  ): Promise<ResponseDto> {
    const serviceProvider =
      await this.serviceProviderService.createServiceProvider(dto);
    return {
      code: 0,
      message: '创建成功',
      data: serviceProvider,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新服务商' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async updateServiceProvider(
    @Param('id') id: number,
    @Body() dto: UpdateServiceProviderDto,
  ): Promise<ResponseDto> {
    const serviceProvider =
      await this.serviceProviderService.updateServiceProvider(id, dto);
    return {
      code: 0,
      message: '更新成功',
      data: serviceProvider,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除服务商' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteServiceProvider(@Param('id') id: number): Promise<ResponseDto> {
    await this.serviceProviderService.deleteServiceProvider(id);
    return {
      code: 0,
      message: '删除成功',
    };
  }

  @Get(':id/descendants')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有后代节点' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getDescendants(@Param('id') id: number): Promise<ResponseDto> {
    const descendants = await this.serviceProviderService.getAllDescendants(id);
    return {
      code: 0,
      message: '获取成功',
      data: descendants,
    };
  }

  @Get(':id/ancestors')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有祖先节点' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getAncestors(@Param('id') id: number): Promise<ResponseDto> {
    const ancestors = await this.serviceProviderService.getAllAncestors(id);
    return {
      code: 0,
      message: '获取成功',
      data: ancestors,
    };
  }

  @Get(':id/path')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取完整路径' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getFullPath(@Param('id') id: number): Promise<ResponseDto> {
    const path = await this.serviceProviderService.getFullPath(id);
    return {
      code: 0,
      message: '获取成功',
      data: path,
    };
  }

  @Get(':id/children-stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '按类型统计子节点' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getChildrenStats(@Param('id') id: number): Promise<ResponseDto> {
    const stats = await this.serviceProviderService.countDescendantsByType(id);
    return {
      code: 0,
      message: '获取成功',
      data: stats,
    };
  }

  @Get('type/:type')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '按类型查询节点' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getByType(
    @Param('type') type: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.serviceProviderService.getServiceProviders(
      type as ServiceProviderType | undefined,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Get('roots')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有根节点' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getRoots(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.serviceProviderService.getServiceProviders(
      ServiceProviderType.FRANCHISE,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }
}
