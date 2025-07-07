import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { UserIngredient } from '../../users/entities/user-ingredient.entity';
import { RecipeSuggestionStrategy } from './recipe-suggestion-strategy.interface';
import { SuggestRecipesResponseDto } from '../dto/suggested-recipe.dto';

interface SuggestedRecipeInfo extends Recipe {
  matchPercentage: number;
  missingIngredients?: { name: string; quantity: string; unit: string }[];
  availableUserIngredientsUsed?: string[];
}

const MINIMUM_INGREDIENT_MATCH_PERCENTAGE = 0.3;

@Injectable()
export class InventoryMatchStrategy implements RecipeSuggestionStrategy {
  private readonly logger = new Logger(InventoryMatchStrategy.name);

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(UserIngredient)
    private readonly userIngredientRepository: Repository<UserIngredient>,
  ) {}

  async execute(
    userId: string,
    availableIngredientIds?: string[]
  ): Promise<SuggestRecipesResponseDto> {
    this.logger.log(`Executing inventory match strategy for user ${userId}`);

    let userAvailableIngredientIds: string[];

    if (availableIngredientIds && availableIngredientIds.length > 0) {
      userAvailableIngredientIds = availableIngredientIds;
    } else {
      // Obtener ingredientes del usuario desde la base de datos
      const userIngredients = await this.userIngredientRepository.find({
        where: { user: { id: userId } },
        relations: ['ingredient'],
      });
      userAvailableIngredientIds = userIngredients.map(ui => ui.ingredient.id);
    }

    if (userAvailableIngredientIds.length === 0) {
      this.logger.warn(`User ${userId} has no available ingredients`);
      return {
        suggestedRecipes: [],
        totalAvailableIngredients: 0,
        totalFoundRecipes: 0,
      };
    }

    // Obtener todas las recetas con sus ingredientes
    const allRecipes = await this.recipeRepository.find({
      relations: [
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'requiredTools',
      ],
    });

    const suggestedRecipes: SuggestedRecipeInfo[] = [];

    for (const recipe of allRecipes) {
      const recipeIngredientIds = recipe.recipeIngredients.map(
        ri => ri.ingredient.id
      );

      if (recipeIngredientIds.length === 0) continue;

      // Calcular ingredientes disponibles que coinciden
      const matchingIngredients = recipeIngredientIds.filter(ingredientId =>
        userAvailableIngredientIds.includes(ingredientId)
      );

      const matchPercentage = matchingIngredients.length / recipeIngredientIds.length;

      // Solo incluir recetas que superen el umbral mínimo
      if (matchPercentage >= MINIMUM_INGREDIENT_MATCH_PERCENTAGE) {
        const missingIngredientIds = recipeIngredientIds.filter(
          ingredientId => !userAvailableIngredientIds.includes(ingredientId)
        );

        const missingIngredients = recipe.recipeIngredients
          .filter(ri => missingIngredientIds.includes(ri.ingredient.id))
          .map(ri => ({
            name: ri.ingredient.name,
            quantity: ri.quantity,
            unit: ri.unit,
          }));

        const availableUserIngredientsUsed = recipe.recipeIngredients
          .filter(ri => matchingIngredients.includes(ri.ingredient.id))
          .map(ri => ri.ingredient.name);

        const suggestedRecipe: SuggestedRecipeInfo = {
          ...recipe,
          matchPercentage: Math.round(matchPercentage * 100),
          missingIngredients,
          availableUserIngredientsUsed,
        };

        suggestedRecipes.push(suggestedRecipe);
      }
    }

    // Ordenar por porcentaje de coincidencia (descendente)
    suggestedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);

    this.logger.log(`Found ${suggestedRecipes.length} suggested recipes for user ${userId}`);

    // Convertir a formato DTO correcto
    const suggestedRecipesDto = suggestedRecipes.map(recipe => ({
      recipe: recipe as Recipe,
      matchPercentage: recipe.matchPercentage,
      missingIngredients: recipe.missingIngredients || [],
      availableUserIngredientsUsed: recipe.availableUserIngredientsUsed || [],
    }));

    return {
      suggestedRecipes: suggestedRecipesDto,
      totalAvailableIngredients: userAvailableIngredientIds.length,
      totalFoundRecipes: suggestedRecipes.length,
    };
  }
} 