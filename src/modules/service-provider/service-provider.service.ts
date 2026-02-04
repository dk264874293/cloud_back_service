import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceProvider,
  ServiceProviderType,
  ServiceProviderStatus,
} from './entities/service-provider.entity';
import { CacheService } from './cache.service';

@Injectable()
export class ServiceProviderService {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly serviceProviderRepository: Repository<ServiceProvider>,
    private readonly cacheService: CacheService,
  ) {}

  async getServiceProviders(
    type?: ServiceProviderType,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    serviceProviders: ServiceProvider[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where = type ? { type } : {};

    const [serviceProviders, total] =
      await this.serviceProviderRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

    return { serviceProviders, total, page, limit };
  }

  async getServiceProviderById(id: number): Promise<ServiceProvider> {
    const serviceProvider = await this.serviceProviderRepository.findOne({
      where: { id },
    });

    if (!serviceProvider) {
      throw new NotFoundException('服务商不存在');
    }

    return serviceProvider;
  }

  async createServiceProvider(
    data: Partial<ServiceProvider>,
  ): Promise<ServiceProvider> {
    const serviceProvider = new ServiceProvider();

    // 类型约束验证
    if (data.parentId) {
      const parent = await this.getServiceProviderById(data.parentId);

      // FRANCHISE 只能创建 CHANNEL 子节点
      if (
        parent.type === ServiceProviderType.FRANCHISE &&
        data.type !== ServiceProviderType.CHANNEL
      ) {
        throw new BadRequestException('加盟商只能创建渠道商类型的子节点');
      }

      // CHANNEL 只能创建 SERVICE_PROVIDER 子节点
      if (
        parent.type === ServiceProviderType.CHANNEL &&
        data.type !== ServiceProviderType.SERVICE_PROVIDER
      ) {
        throw new BadRequestException('渠道商只能创建服务商类型的子节点');
      }

      // SERVICE_PROVIDER 不能创建子节点
      if (parent.type === ServiceProviderType.SERVICE_PROVIDER) {
        throw new BadRequestException('服务商不能创建子节点');
      }

      // 自动计算层级字段
      serviceProvider.level = parent.level + 1;
      serviceProvider.path = parent.path
        ? `${parent.path}/${parent.id}`
        : `${parent.id}`;
      serviceProvider.rootId = parent.rootId || parent.id;
    } else {
      // 根节点必须是 FRANCHISE
      if (data.type !== ServiceProviderType.FRANCHISE) {
        throw new BadRequestException('根节点必须是加盟商类型');
      }

      serviceProvider.level = 0;
      serviceProvider.path = '';
    }

    serviceProvider.name = data.name!;
    serviceProvider.abbreviation = data.abbreviation || '';
    serviceProvider.type = data.type!;
    serviceProvider.region = data.region || '';
    if (data.parentId !== undefined) {
      serviceProvider.parentId = data.parentId;
    }
    serviceProvider.contactPerson = data.contactPerson || '';
    serviceProvider.contactPhone = data.contactPhone || '';
    serviceProvider.status = ServiceProviderStatus.ACTIVE;

    const result = await this.serviceProviderRepository.save(serviceProvider);

    // 如果有父节点，清除父节点的后代缓存
    if (data.parentId) {
      await this.cacheService.invalidateDescendantsCache(data.parentId);
    }

    return result;
  }

  async updateServiceProvider(
    id: number,
    data: Partial<ServiceProvider>,
  ): Promise<ServiceProvider> {
    const serviceProvider = await this.serviceProviderRepository.findOne({
      where: { id },
    });

    if (!serviceProvider) {
      throw new NotFoundException('服务商不存在');
    }

    // 禁止修改 parentId（节点移动功能已明确排除）
    if (
      data.parentId !== undefined &&
      data.parentId !== serviceProvider.parentId
    ) {
      throw new BadRequestException('不允许更换父节点（节点创建后不允许移动）');
    }

    if (data.name !== undefined) serviceProvider.name = data.name;
    if (data.abbreviation !== undefined)
      serviceProvider.abbreviation = data.abbreviation;
    if (data.region !== undefined) serviceProvider.region = data.region;
    if (data.contactPerson !== undefined)
      serviceProvider.contactPerson = data.contactPerson;
    if (data.contactPhone !== undefined)
      serviceProvider.contactPhone = data.contactPhone;
    if (data.status !== undefined) serviceProvider.status = data.status;

    const result = await this.serviceProviderRepository.save(serviceProvider);

    // 如果有父节点，清除父节点的后代缓存
    if (data.parentId) {
      await this.cacheService.invalidateDescendantsCache(data.parentId);
    }

    return result;
  }

  async deleteServiceProvider(id: number): Promise<void> {
    await this.serviceProviderRepository.delete(id);

    // 清除节点的所有相关缓存
    await this.cacheService.invalidateNodeCache(id);
  }

  /**
   * 获取某个节点的所有后代（递归）
   */
  async getAllDescendants(id: number): Promise<ServiceProvider[]> {
    // 先查缓存
    const cached = await this.cacheService.getDescendantsCache(id);
    if (cached) {
      return cached;
    }

    // 缓存未命中，查询数据库
    const result = await this.serviceProviderRepository.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT * FROM service_providers WHERE id = ?
        UNION ALL
        SELECT sp.* FROM service_providers sp
        INNER JOIN descendants d ON sp.parent_id = d.id
      )
      SELECT * FROM descendants WHERE id != ? ORDER BY level, id
      `,
      [id, id],
    );

    // 写入缓存
    await this.cacheService.setDescendantsCache(id, result);

    return result;
  }

  /**
   * 获取某个节点的所有祖先（递归）
   */
  async getAllAncestors(id: number): Promise<ServiceProvider[]> {
    // 先查缓存
    const cached = await this.cacheService.getAncestorsCache(id);
    if (cached) {
      return cached;
    }

    // 缓存未命中，查询数据库
    const result = await this.serviceProviderRepository.query(
      `
      WITH RECURSIVE ancestors AS (
        SELECT * FROM service_providers WHERE id = ?
        UNION ALL
        SELECT p.* FROM service_providers p
        INNER JOIN ancestors a ON p.id = a.parent_id
      )
      SELECT * FROM ancestors WHERE id != ? ORDER BY level DESC
      `,
      [id, id],
    );

    // 写入缓存
    await this.cacheService.setAncestorsCache(id, result);

    return result;
  }

  /**
   * 获取从根到节点的完整路径
   */
  async getFullPath(id: number): Promise<ServiceProvider[]> {
    // 先查缓存
    const cached = await this.cacheService.getPathCache(id);
    if (cached) {
      return cached;
    }

    const node = await this.getServiceProviderById(id);
    if (!node.path) {
      return [node];
    }

    const pathIds = node.path.split('/').map(Number);
    const result = await this.serviceProviderRepository
      .createQueryBuilder('sp')
      .where('sp.id IN (:...ids)', { ids: pathIds })
      .orderBy('sp.level')
      .getMany();

    // 写入缓存
    await this.cacheService.setPathCache(id, result);

    return result;
  }

  /**
   * 统计某个节点下的所有子孙节点数量（按类型）
   */
  async countDescendantsByType(id: number): Promise<Record<string, number>> {
    // 先查缓存
    const cached = await this.cacheService.getStatsCache(id);
    if (cached) {
      return cached;
    }

    const result = await this.serviceProviderRepository.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT * FROM service_providers WHERE id = ?
        UNION ALL
        SELECT sp.* FROM service_providers sp
        INNER JOIN descendants d ON sp.parent_id = d.id
      )
      SELECT type, COUNT(*) as count
      FROM descendants
      WHERE id != ?
      GROUP BY type
      `,
      [id, id],
    );

    const counts: Record<string, number> = {};
    for (const row of result) {
      counts[row.type] = parseInt(row.count.toString(), 10);
    }

    // 写入缓存
    await this.cacheService.setStatsCache(id, counts);

    return counts;
  }
}
