import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigService } from '@/config/config.service';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    {
      provide: ConfigService,
      useFactory: () => new ConfigService(),
    },
  ],
  exports: [UserService],
})
export class UserModule {}
