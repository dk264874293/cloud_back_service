import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceProvider } from './entities/service-provider.entity';
import { ServiceProviderController } from './service-provider.controller';
import { ServiceProviderService } from './service-provider.service';
import { CacheService } from './cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceProvider])],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService, CacheService],
  exports: [ServiceProviderService],
})
export class ServiceProviderModule {}
