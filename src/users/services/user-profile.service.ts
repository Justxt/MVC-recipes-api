import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepositoryPort } from '../../domain/users/repositories/user-repository.port';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Delegating user creation to repository port`);
    return this.userRepository.create(createUserDto);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    this.logger.verbose(`Delegating user search by email to repository port`);
    return this.userRepository.findOneByEmail(email);
  }

  async findOneById(id: string): Promise<User | undefined> {
    this.logger.verbose(`Delegating user search by ID to repository port`);
    return this.userRepository.findOneById(id);
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    this.logger.log(`Delegating profile update to repository port for user ID: ${userId}`);
    return this.userRepository.updateProfile(userId, updateUserProfileDto);
  }
} 