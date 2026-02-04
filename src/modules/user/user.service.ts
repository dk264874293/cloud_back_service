import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { VerifyRoleDto } from './dto/verify-role.dto';
import { UserRole } from '@/common/enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'phone', 'nickname', 'avatar', 'role', 'is_verified', 'verification_status'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }

  async switchRole(userId: number, switchRoleDto: SwitchRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.role === switchRoleDto.role) {
      return user;
    }

    if (switchRoleDto.role !== UserRole.USER && !user.is_verified) {
      throw new ForbiddenException('请先完成认证');
    }

    user.role = switchRoleDto.role;
    return this.userRepository.save(user);
  }

  async verifyRole(userId: number, verifyRoleDto: VerifyRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.role === verifyRoleDto.role) {
      throw new ForbiddenException('该角色已认证');
    }

    user.verification_status = 'PENDING';
    user.verification_data = {
      name: verifyRoleDto.name,
      id_card: verifyRoleDto.id_card,
      documents: verifyRoleDto.documents,
    };

    return this.userRepository.save(user);
  }
}
