import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';
import { User } from '../user/user.entity';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, User])],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
