import { User } from '../../../users/entities/user.entity';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { UpdateUserProfileDto } from '../../../users/dto/update-user-profile.dto';

export interface UserRepositoryPort {
  create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>>;
  findOneByEmail(email: string): Promise<User | undefined>;
  findOneById(id: string): Promise<User | undefined>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<Omit<User, 'password_hash'>>;
} 