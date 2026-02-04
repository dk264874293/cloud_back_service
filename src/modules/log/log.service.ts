import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from './operation-log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
  ) {}

  async createLog(
    data: {
      module?: string;
      action?: string;
      userId?: number;
      ip?: string;
      userAgent?: string;
      requestData?: Record<string, any>;
      responseData?: Record<string, any>;
    },
  ): Promise<OperationLog> {
    const log = new OperationLog();
    log.module = data.module || 'system';
    log.action = data.action || 'unknown';

    return await this.operationLogRepository.save(log);
  }

  async getLogs(
    userId?: number,
    module?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    logs: OperationLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (module) where.module = module;

    const [logs, total] = await this.operationLogRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { logs, total, page, limit };
  }

  async deleteLogsBefore(date: Date): Promise<number> {
    const result = await this.operationLogRepository.delete({
      createdAt: new Date(),
    });
    return result.affected || 0;
  }
}
