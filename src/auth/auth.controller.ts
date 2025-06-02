import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body() createUserDto: CreateUserDto,
  ) {
    this.logger.log(`Registering user: ${createUserDto.email}`);
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    this.logger.log(`Login attempt for user: ${loginUserDto.email}`);

    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      this.logger.warn(
        `Login failed: Invalid credentials for ${loginUserDto.email}`,
      );
      throw new UnauthorizedException(
        'Credenciales inválidas. Por favor, inténtalo de nuevo.',
      );
    }

    this.logger.log(`User ${user.email} validated, generating token.`);
    return this.authService.login(user);
  }
}
