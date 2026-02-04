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
import { BankService } from './bank.service';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('bank')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取银行列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getBanks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.bankService.getBanks(
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建银行' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createBank(
    @Body('name') name: string,
    @Body('code') code: string,
  ): Promise<ResponseDto> {
    const bank = await this.bankService.createBank(name, code);
    return {
      code: 0,
      message: '创建成功',
      data: bank,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除银行' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteBank(@Param('id') id: number): Promise<ResponseDto> {
    await this.bankService.deleteBank(id);
    return {
      code: 0,
      message: '删除成功',
    };
  }
}

@ApiTags('bank-branch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/bank-branches')
export class BankBranchController {
  constructor(private readonly bankService: BankService) {}

  @Get(':bankId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取银行分行列表' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async getBankBranches(
    @Param('bankId') bankId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto> {
    const result = await this.bankService.getBankBranches(
      bankId,
      page || 1,
      limit || 10,
    );
    return {
      code: 0,
      message: '获取成功',
      data: result,
    };
  }

  @Post(':bankId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建银行分行' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async createBankBranch(
    @Param('bankId') bankId: number,
    @Body('name') name: string,
    @Body('province') province: string,
    @Body('city') city: string,
    @Body('address') address: string,
  ): Promise<ResponseDto> {
    const branch = await this.bankService.createBankBranch(
      bankId,
      name,
      province,
      city,
      address,
    );
    return {
      code: 0,
      message: '创建成功',
      data: branch,
    };
  }

  @Delete('branch/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除银行分行' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async deleteBankBranch(@Param('id') id: number): Promise<ResponseDto> {
    await this.bankService.deleteBankBranch(id);
    return {
      code: 0,
      message: '删除成功',
    };
  }
}
