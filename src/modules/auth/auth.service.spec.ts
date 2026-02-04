import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        phone: '13800138000',
        password: 'password123',
        verification_code: '123456',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        phone: registerDto.phone,
        password_hash: 'hashed-password',
        role: UserRole.USER,
        is_verified: false,
      } as never);
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        phone: registerDto.phone,
        role: UserRole.USER,
        nickname: null,
        avatar: null,
        is_verified: false,
      } as never);

      mockJwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { phone: registerDto.phone },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toHaveProperty('id', 1);
    });

    it('should throw ConflictException if phone already registered', async () => {
      const registerDto: RegisterDto = {
        phone: '13800138000',
        password: 'password123',
        verification_code: '123456',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        phone: registerDto.phone,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('手机号已注册'),
      );
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto: LoginDto = {
        phone: '13800138000',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        phone: loginDto.phone,
        password_hash: 'hashed-password',
        role: UserRole.USER,
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        is_verified: true,
      };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      mockUserRepository.findOne.mockResolvedValue(mockUser as never);
      mockJwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        'hashed-password',
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.phone).toBe(loginDto.phone);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        phone: '13800138000',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('用户不存在'),
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        phone: '13800138000',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        phone: loginDto.phone,
        password_hash: 'hashed-password',
        role: UserRole.USER,
      };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      mockUserRepository.findOne.mockResolvedValue(mockUser as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('密码错误'),
      );
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 1, phone: '13800138000', role: UserRole.USER };

      const mockUser = {
        id: 1,
        phone: '13800138000',
        role: UserRole.USER,
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        is_verified: true,
      };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refresh(refreshToken);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub },
        select: ['id', 'phone', 'role', 'nickname', 'avatar', 'is_verified'],
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('刷新令牌无效或已过期'),
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user with valid userId', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        phone: '13800138000',
        role: UserRole.USER,
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        is_verified: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'phone', 'role', 'nickname', 'avatar', 'is_verified'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const userId = 999;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow(
        new UnauthorizedException('用户不存在'),
      );
    });
  });
});
