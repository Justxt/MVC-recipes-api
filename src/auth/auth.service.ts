import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, name: user.name };

    this.logger.log(
      `Generating token for user: ${user.email} (ID: ${user.id})`,
    );
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    this.logger.log(`Attempting to register user: ${createUserDto.email}`);
    return this.usersService.create(createUserDto);
  }
}
