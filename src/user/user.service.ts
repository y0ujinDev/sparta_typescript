import _ from 'lodash';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(registerDto.password, 10);

    await this.userRepository.save({
      ...registerDto,
      password: hashedPassword,
    });

    return {
      message: 'Register success',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email: loginDto.email },
    });

    if (_.isNil(user)) {
      throw new UnauthorizedException('Check your email.');
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Check your password.');
    }

    const payload = { email: user.email, sub: user.id };

    return {
      message: 'Login success',
      access_token: this.jwtService.sign(payload),
    };
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
}
