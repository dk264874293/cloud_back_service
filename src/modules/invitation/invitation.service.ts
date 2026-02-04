import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from './invitation.entity';
import { User } from '../user/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createInvitation(inviterId: number): Promise<Invitation> {
    const invitationCode = this.generateInvitationCode();

    const invitation = new Invitation();
    invitation.inviterId = inviterId;
    invitation.invitationCode = invitationCode;
    invitation.status = InvitationStatus.PENDING;
    invitation.commissionAmount = 0;

    return await this.invitationRepository.save(invitation);
  }

  async acceptInvitation(
    inviteeId: number,
    invitationCode: string,
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { invitationCode, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      throw new NotFoundException('邀请码无效');
    }

    invitation.inviteeId = inviteeId;
    invitation.status = InvitationStatus.ACCEPTED;

    return await this.invitationRepository.save(invitation);
  }

  async getInvitationsByInviter(
    inviterId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    invitations: Invitation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [invitations, total] = await this.invitationRepository.findAndCount({
      where: { inviterId },
      relations: ['inviter', 'invitee'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { invitations, total, page, limit };
  }

  async getInvitationByCode(invitationCode: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { invitationCode },
      relations: ['inviter'],
    });

    if (!invitation) {
      throw new NotFoundException('邀请码不存在');
    }

    return invitation;
  }

  async updateCommission(
    invitationId: number,
    amount: number,
  ): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('邀请记录不存在');
    }

    invitation.commissionAmount += amount;

    await this.invitationRepository.save(invitation);
  }

  private generateInvitationCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }
}
