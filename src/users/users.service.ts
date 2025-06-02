import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserIngredient } from './entities/user-ingredient.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserIngredientsDto } from './dto/manage-user-ingredients.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Tool } from 'src/tools/entities/tool.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIngredient)
    private readonly userIngredientRepository: Repository<UserIngredient>,
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email, ...userData } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
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

    const { password_hash: _, ...result } = savedUser;
    return result;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      throw new NotFoundException(
        'El correo electrónico no puede estar vacío.',
      );
    }
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['ownedTools'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
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

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
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
    const { password_hash, ...result } = updatedUser;
    return result;
  }

  async updateUserIngredients(
    userId: string,
    updateIngredientsDto: UpdateUserIngredientsDto,
  ): Promise<{ success: boolean; availableIngredients: any[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    // Verificar que todos los ingredientes existen
    const ingredients = await this.ingredientRepository.findBy({
      id: In(updateIngredientsDto.ingredientIds),
    });

    if (ingredients.length !== updateIngredientsDto.ingredientIds.length) {
      throw new BadRequestException(
        'Uno o más ingredientes proporcionados no son válidos.',
      );
    }

    // Eliminar ingredientes existentes del usuario
    await this.userIngredientRepository.delete({ user: { id: userId } });

    // Crear nuevos registros de ingredientes del usuario
    const userIngredients = updateIngredientsDto.ingredientIds.map(
      (ingredientId) => {
        const ingredient = ingredients.find((ing) => ing.id === ingredientId);
        return this.userIngredientRepository.create({
          user,
          ingredient: ingredient!,
        });
      },
    );

    await this.userIngredientRepository.save(userIngredients);

    // Retornar la lista actualizada
    const updatedIngredients = await this.getUserIngredients(userId);

    return {
      success: true,
      availableIngredients: updatedIngredients,
    };
  }

  async getUserIngredients(userId: string): Promise<any[]> {
    const userIngredients = await this.userIngredientRepository.find({
      where: { user: { id: userId } },
      relations: ['ingredient'],
      select: {
        ingredient: {
          id: true,
          name: true,
          description: true,
          tags: true,
          imageUrl: true,
        },
      },
    });

    return userIngredients.map((ui) => ui.ingredient);
  }

  async addUserIngredient(
    userId: string,
    ingredientId: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const ingredient = await this.ingredientRepository.findOne({
      where: { id: ingredientId },
    });
    if (!ingredient) {
      throw new NotFoundException(
        `Ingrediente con ID "${ingredientId}" no encontrado.`,
      );
    }

    // Verificar si ya existe
    const existingUserIngredient = await this.userIngredientRepository.findOne(
      {
        where: {
          user: { id: userId },
          ingredient: { id: ingredientId },
        },
      },
    );

    if (existingUserIngredient) {
      return {
        success: false,
        message: 'El ingrediente ya está en tu lista.',
      };
    }

    const userIngredient = this.userIngredientRepository.create({
      user,
      ingredient,
    });

    await this.userIngredientRepository.save(userIngredient);

    return {
      success: true,
      message: 'Ingrediente agregado exitosamente.',
    };
  }

  async removeUserIngredient(
    userId: string,
    ingredientId: string,
  ): Promise<{ success: boolean; message: string }> {
    const userIngredient = await this.userIngredientRepository.findOne({
      where: {
        user: { id: userId },
        ingredient: { id: ingredientId },
      },
    });

    if (!userIngredient) {
      throw new NotFoundException(
        'El ingrediente no está en tu lista de ingredientes disponibles.',
      );
    }

    await this.userIngredientRepository.remove(userIngredient);

    return {
      success: true,
      message: 'Ingrediente eliminado exitosamente.',
    };
  }
}
