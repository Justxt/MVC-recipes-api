import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

// Este payload es el que definimos al crear el token en AuthService.login()
interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
    this.logger.log('JwtStrategy initialized');
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    this.logger.verbose(
      `Validating JWT payload for user ID: ${payload.sub} (Email: ${payload.email})`,
    );

    const user = await this.usersService.findOneById(payload.sub);

    if (!user) {
      this.logger.warn(
        `User with ID ${payload.sub} from JWT payload not found.`,
      );
      throw new UnauthorizedException(
        'Token inválido o usuario no encontrado.',
      );
    }

    // Si el usuario existe, Passport lo adjuntará a req.user.
    this.logger.verbose(`User ${user.email} successfully validated from JWT.`);
    return user;
  }
}
