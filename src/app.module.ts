import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwaggerModule } from '@nestjs/swagger';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { redisConfig } from './config/redis.config';
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
      useFactory: async (configService: any) => ({
        store: redisStore,
        host: configService.REDIS.host,
        port: configService.REDIS.port,
        password: configService.REDIS.password,
        db: configService.REDIS.db,
      }),
      inject: [redisConfig.KEY],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
