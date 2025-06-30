import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tool } from '../../tools/entities/tool.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserProfileDto } from '../../users/dto/update-user-profile.dto';
import { UserRepositoryPort } from '../../domain/users/repositories/user-repository.port';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TypeOrmUserRepositoryAdapter implements UserRepositoryPort {
  private readonly logger = new Logger(TypeOrmUserRepositoryAdapter.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    const { password, email, ...userData } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      this.logger.warn(`User creation failed: Email ${email} already exists`);
      throw new ConflictException('El correo electrónico ya está en uso.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      ...userData,
      email,
      password_hash: hashedPassword,
      dietary_restrictions: createUserDto.dietary_restrictions || [],
      cooking_level: createUserDto.cooking_level || 'principiante',
    });

    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(`User created successfully with ID: ${savedUser.id} and email: ${email}`);

    const { password_hash: _, ...result } = savedUser;
    return result as Omit<User, 'password_hash'>;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    this.logger.verbose(`Finding user by email: ${email}`);
    if (!email) {
      this.logger.error('Email cannot be empty when finding user');
      throw new NotFoundException(
        'El correo electrónico no puede estar vacío.',
      );
    }
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['ownedTools'],
    });
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('Usuario no encontrado.');
    }
    this.logger.verbose(`User found with email: ${email}`);
    return user;
  }

  async findOneById(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['ownedTools'],
    });
    if (user) {
      const { password_hash, ...result } = user;
      return result as User;
    }
    return undefined;
  }

  async updateProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<Omit<User, 'password_hash'>> {
    this.logger.log(`Updating profile for user ID: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`User not found for profile update, ID: ${userId}`);
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const { ownedToolIds, ...profileData } = updateUserProfileDto;

    this.userRepository.merge(user, profileData);

    if (ownedToolIds !== undefined) {
      if (ownedToolIds.length > 0) {
        const tools = await this.toolRepository.findBy({
          id: In(ownedToolIds),
        });
        if (tools.length !== ownedToolIds.length) {
          this.logger.error(`Invalid tool IDs provided for user ${userId}: ${ownedToolIds}`);
          throw new BadRequestException(
            'Uno o más IDs de herramientas proporcionados no son válidos.',
          );
        }
        user.ownedTools = tools;
      } else {
        user.ownedTools = [];
      }
    }

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`Profile updated successfully for user ID: ${userId}`);
    const { password_hash, ...result } = updatedUser;
    return result as Omit<User, 'password_hash'>;
  }
} 