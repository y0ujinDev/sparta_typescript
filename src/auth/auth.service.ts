import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import _ from 'lodash';

import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from 'src/user/types/userRole.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(registerDto.password, 10);

    const userRole = registerDto.role ? registerDto.role : Role.USER;

    await this.userRepository.save({
      ...registerDto,
      password: hashedPassword,
      role: userRole,
    });

    return {
      message: 'Register success',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password', 'role'],
      where: { email: loginDto.email },
    });

    if (_.isNil(user)) {
      throw new UnauthorizedException('Check your email.');
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Check your password.');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.userRepository.update(user.id, {
      refresh_token: refreshToken,
    });

    return {
      message: 'Login success',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async refreshAccessToken(email: string) {
    const user = await this.findByEmail(email);
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Refresh token does not exist');
    }

    const payload = this.jwtService.verify(user.refresh_token);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign({
      email: user.email,
      sub: user.id,
    });

    return {
      message: 'Refresh toekn successfully',
      access_token: newAccessToken,
    };
  }
}
