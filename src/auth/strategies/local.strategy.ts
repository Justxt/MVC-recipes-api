import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
    this.logger.log('LocalStrategy initialized');
  }

  async validate(email: string, pass: string): Promise<Omit<User, 'password'>> {
    this.logger.verbose(`Validating user with email: ${email}`);
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      this.logger.warn(`Invalid credentials for email: ${email}`);
      throw new UnauthorizedException(
        'Credenciales inválidas. Por favor, inténtalo de nuevo.',
      );
    }
    this.logger.verbose(`User validated successfully: ${email}`);
    return user;
  }
}
