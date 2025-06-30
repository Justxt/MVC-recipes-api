import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserIngredient } from '../entities/user-ingredient.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { UpdateUserIngredientsDto } from '../dto/manage-user-ingredients.dto';

@Injectable()
export class UserInventoryService {
  private readonly logger = new Logger(UserInventoryService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIngredient)
    private readonly userIngredientRepository: Repository<UserIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async updateUserIngredients(
    userId: string,
    updateIngredientsDto: UpdateUserIngredientsDto,
  ): Promise<{ success: boolean; availableIngredients: any[] }> {
    this.logger.log(`Updating ingredients for user ID: ${userId}, ingredients count: ${updateIngredientsDto.ingredientIds.length}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`User not found for ingredients update, ID: ${userId}`);
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    // Verificar que todos los ingredientes existen
    const ingredients = await this.ingredientRepository.findBy({
      id: In(updateIngredientsDto.ingredientIds),
    });
    
    if (ingredients.length !== updateIngredientsDto.ingredientIds.length) {
      this.logger.error(`Invalid ingredient IDs provided for user ${userId}: ${updateIngredientsDto.ingredientIds}`);
      throw new BadRequestException(
        'Uno o más ingredientes proporcionados no son válidos.',
      );
    }

    this.logger.verbose(`Updating ingredients for user ${userId}: removing ${await this.userIngredientRepository.count({ where: { user: { id: userId } } })} existing ingredients`);
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
    this.logger.log(`Successfully updated ingredients for user ${userId}: ${userIngredients.length} ingredients saved`);

    // Retornar la lista actualizada
    const updatedIngredients = await this.getUserIngredients(userId);

    return {
      success: true,
      availableIngredients: updatedIngredients,
    };
  }

  async getUserIngredients(userId: string): Promise<any[]> {
    this.logger.verbose(`Getting ingredients for user ID: ${userId}`);
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

    this.logger.verbose(`Found ${userIngredients.length} ingredients for user ${userId}`);
    return userIngredients.map((ui) => ui.ingredient);
  }

  async addUserIngredient(
    userId: string,
    ingredientId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Adding ingredient ${ingredientId} to user ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`User not found for ingredient addition, ID: ${userId}`);
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const ingredient = await this.ingredientRepository.findOne({
      where: { id: ingredientId },
    });
    if (!ingredient) {
      this.logger.error(`Ingredient not found for addition, ID: ${ingredientId}`);
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
      this.logger.warn(`Ingredient ${ingredientId} already exists for user ${userId}`);
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
    this.logger.log(`Successfully added ingredient ${ingredientId} to user ${userId}`);

    return {
      success: true,
      message: 'Ingrediente agregado exitosamente.',
    };
  }

  async removeUserIngredient(
    userId: string,
    ingredientId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Removing ingredient ${ingredientId} from user ${userId}`);
    const userIngredient = await this.userIngredientRepository.findOne({
      where: {
        user: { id: userId },
        ingredient: { id: ingredientId },
      },
    });

    if (!userIngredient) {
      this.logger.warn(`Ingredient ${ingredientId} not found in user ${userId} inventory`);
      throw new NotFoundException(
        'El ingrediente no está en tu lista de ingredientes disponibles.',
      );
    }

    await this.userIngredientRepository.remove(userIngredient);
    this.logger.log(`Successfully removed ingredient ${ingredientId} from user ${userId}`);

    return {
      success: true,
      message: 'Ingrediente eliminado exitosamente.',
    };
  }
} 