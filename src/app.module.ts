import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwaggerModule } from '@nestjs/swagger';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CommissionModule } from './modules/commission/commission.module';
import { FileModule } from './modules/file/file.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ServiceProviderModule } from './modules/service-provider/service-provider.module';
import { BankModule } from './modules/bank/bank.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule,
    SwaggerModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: configService.get<number>('REDIS_PORT') || 6379,
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB') || 0,
        ttl: configService.get<number>('REDIS_TTL') || 300,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    OrderModule,
    PaymentModule,
    CommissionModule,
    FileModule,
    InvitationModule,
    FeedbackModule,
    ServiceProviderModule,
    BankModule,
    WithdrawalModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
