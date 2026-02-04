import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/user/user.entity';
import { RegisterDto } from '@/modules/user/dto/register.dto';
import { LoginDto } from '@/modules/user/dto/login.dto';
import { UserRole } from '@/common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phone, password, invitation_code } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('手机号已注册');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      phone,
      password_hash: hashedPassword,
      role: UserRole.USER,
      is_verified: false,
    });

    const savedUser = await this.userRepository.save(user);

    return this.generateTokens(savedUser);
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { phone },
      select: ['id', 'phone', 'password_hash', 'role', 'nickname', 'avatar', 'is_verified'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    return this.generateTokens(user);
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'phone', 'role', 'nickname', 'avatar', 'is_verified'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'phone', 'role', 'nickname', 'avatar', 'is_verified'],
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  async logout(userId: number) {
    return { message: '登出成功' };
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        is_verified: user.is_verified,
      },
    };
  }
}
