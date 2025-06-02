import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { User } from '../users/entities/user.entity';
import { UserIngredient } from '../users/entities/user-ingredient.entity';
import { Tool } from '../tools/entities/tool.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import {
  SuggestedRecipeDto,
  SuggestRecipesResponseDto,
} from './dto/suggested-recipe.dto';
import { EditUserRecipeDto } from './dto/edit-user-recipe.dto';

interface SuggestRecipesDto {
  availableIngredientIds: string[];
}

interface SuggestedRecipeInfo extends Recipe {
  matchPercentage: number;
  missingIngredients?: { name: string; quantity: string; unit: string }[];
  availableUserIngredientsUsed?: string[];
}

const MINIMUM_INGREDIENT_MATCH_PERCENTAGE = 0.75;

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserIngredient)
    private readonly userIngredientRepository: Repository<UserIngredient>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const {
      recipeIngredients: recipeIngredientsDto,
      requiredToolIds,
      steps,
      ...recipeDetails
    } = createRecipeDto;

    this.logger.log(`Creating new recipe: ${recipeDetails.title}`);
    const recipe = this.recipeRepository.create({
      ...recipeDetails,
      steps,
    });
    recipe.recipeIngredients = [];
    recipe.requiredTools = [];

    if (recipeIngredientsDto && recipeIngredientsDto.length > 0) {
      for (const riDto of recipeIngredientsDto) {
        const ingredient = await this.ingredientRepository.findOneBy({
          id: riDto.ingredientId,
        });
        if (!ingredient) {
          this.logger.warn(
            `Ingredient with ID "${riDto.ingredientId}" not found during recipe creation.`,
          );
          throw new BadRequestException(
            `Ingrediente con ID "${riDto.ingredientId}" no encontrado.`,
          );
        }
        const newRecipeIngredient = this.recipeIngredientRepository.create({
          ingredient: ingredient,
          quantity: riDto.quantity,
          unit: riDto.unit,
          notes: riDto.notes,
        });
        recipe.recipeIngredients.push(newRecipeIngredient);
      }
    }

    if (requiredToolIds && requiredToolIds.length > 0) {
      const tools = await this.toolRepository.findBy({
        id: In(requiredToolIds),
      });
      if (tools.length !== requiredToolIds.length) {
        this.logger.warn(
          'One or more tool IDs not found during recipe creation.',
        );
        throw new BadRequestException(
          'Uno o más IDs de herramientas proporcionados no son válidos.',
        );
      }
      recipe.requiredTools = tools;
    }

    try {
      const savedRecipe = await this.recipeRepository.save(recipe);
      this.logger.log(
        `Recipe "${savedRecipe.title}" (ID: ${savedRecipe.id}) created successfully.`,
      );
      return this.findOne(savedRecipe.id);
    } catch (error) {
      this.logger.error(`Error creating recipe: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Error al crear la receta: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Recipe[]> {
    this.logger.log('Fetching all recipes.');
    return this.recipeRepository.find({
      relations: [
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'requiredTools',
      ],
    });
  }

  async findOne(id: string): Promise<Recipe> {
    this.logger.log(`Fetching recipe with ID: ${id}`);
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: [
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'requiredTools',
      ],
    });
    if (!recipe) {
      this.logger.warn(`Recipe with ID "${id}" not found.`);
      throw new NotFoundException(`Receta con ID "${id}" no encontrada.`);
    }
    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    this.logger.log(`Attempting to update recipe with ID: ${id}`);
    const {
      recipeIngredients: recipeIngredientsDto,
      requiredToolIds,
      ...recipeDetailsToUpdate
    } = updateRecipeDto;

    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: ['recipeIngredients', 'requiredTools'],
    });

    if (!recipe) {
      this.logger.warn(`Recipe with ID "${id}" not found for update.`);
      throw new NotFoundException(`Receta con ID "${id}" no encontrada.`);
    }

    this.recipeRepository.merge(recipe, recipeDetailsToUpdate);

    if (recipeIngredientsDto !== undefined) {
      this.logger.log(`Updating recipe ingredients for recipe ID: ${id}`);
      if (recipe.recipeIngredients && recipe.recipeIngredients.length > 0) {
        await this.recipeIngredientRepository.remove(recipe.recipeIngredients);
      }

      recipe.recipeIngredients = [];
      if (recipeIngredientsDto.length > 0) {
        for (const riDto of recipeIngredientsDto) {
          const ingredient = await this.ingredientRepository.findOneBy({
            id: riDto.ingredientId,
          });
          if (!ingredient) {
            this.logger.warn(
              `Ingredient with ID "${riDto.ingredientId}" not found during recipe update.`,
            );
            throw new BadRequestException(
              `Ingrediente con ID "${riDto.ingredientId}" no encontrado.`,
            );
          }
          const newRecipeIngredient = this.recipeIngredientRepository.create({
            ingredient: ingredient,
            quantity: riDto.quantity,
            unit: riDto.unit,
            notes: riDto.notes,
          });
          recipe.recipeIngredients.push(newRecipeIngredient);
        }
      }
    }

    if (requiredToolIds !== undefined) {
      this.logger.log(`Updating required tools for recipe ID: ${id}`);
      if (requiredToolIds.length > 0) {
        const tools = await this.toolRepository.findBy({
          id: In(requiredToolIds),
        });
        if (tools.length !== requiredToolIds.length) {
          this.logger.warn(
            'One or more tool IDs not valid during recipe update.',
          );
          throw new BadRequestException(
            'Uno o más IDs de herramientas para actualizar no son válidos.',
          );
        }
        recipe.requiredTools = tools;
      } else {
        recipe.requiredTools = [];
      }
    }

    try {
      const savedRecipe = await this.recipeRepository.save(recipe);
      this.logger.log(`Recipe with ID: ${id} updated successfully.`);
      return this.findOne(savedRecipe.id);
    } catch (error) {
      this.logger.error(
        `Error updating recipe with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error al actualizar la receta: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to remove recipe with ID: ${id}`);
    const recipe = await this.recipeRepository.findOneBy({ id });

    if (!recipe) {
      this.logger.warn(`Recipe with ID "${id}" not found for removal.`);
      throw new NotFoundException(`Receta con ID "${id}" no encontrada.`);
    }

    await this.recipeRepository.remove(recipe);
    this.logger.log(`Recipe with ID: ${id} removed successfully.`);
  }

  async suggestRecipesByInventoryDetailed(
    userId: string,
    suggestDto: SuggestRecipesDto,
  ): Promise<SuggestRecipesResponseDto> {
    this.logger.log(
      `Suggesting detailed recipes for user ID: ${userId} with available ingredients: ${suggestDto.availableIngredientIds.join(', ')}`,
    );
    const { availableIngredientIds } = suggestDto;

    if (!availableIngredientIds || availableIngredientIds.length === 0) {
      throw new BadRequestException(
        'Debes proporcionar al menos un ingrediente disponible.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['ownedTools'],
    });

    if (!user) {
      this.logger.warn(
        `User with ID "${userId}" not found for recipe suggestion.`,
      );
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const userDietaryRestrictions = user.dietary_restrictions || [];
    const userOwnedToolIds = user.ownedTools?.map((tool) => tool.id) || [];

    const allRecipes = await this.recipeRepository.find({
      relations: [
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'requiredTools',
      ],
    });

    const suggestedRecipesDetailed: SuggestedRecipeDto[] = [];

    for (const recipe of allRecipes) {
      if (!recipe.recipeIngredients || recipe.recipeIngredients.length === 0) {
        continue;
      }

      let matchedIngredientCount = 0;
      const recipeTotalIngredients = recipe.recipeIngredients.length;
      const missingIngredients: {
        name: string;
        quantity: string;
        unit: string;
      }[] = [];
      const availableUserIngredientsUsed: string[] = [];

      for (const ri of recipe.recipeIngredients) {
        if (
          ri.ingredient &&
          availableIngredientIds.includes(ri.ingredient.id)
        ) {
          matchedIngredientCount++;
          if (ri.ingredient.name) {
            availableUserIngredientsUsed.push(ri.ingredient.name);
          }
        } else if (ri.ingredient) {
          missingIngredients.push({
            name: ri.ingredient.name,
            quantity: ri.quantity,
            unit: ri.unit,
          });
        }
      }

      if (matchedIngredientCount === 0 && recipeTotalIngredients > 0) {
        continue;
      }

      const matchPercentage =
        recipeTotalIngredients > 0
          ? matchedIngredientCount / recipeTotalIngredients
          : 0;

      if (
        matchPercentage < MINIMUM_INGREDIENT_MATCH_PERCENTAGE &&
        recipeTotalIngredients > 0
      ) {
        continue;
      }

      // Verificar restricciones dietéticas
      let passesDietaryRestrictions = true;
      if (userDietaryRestrictions.length > 0) {
        for (const ri of recipe.recipeIngredients) {
          if (
            ri.ingredient?.tags?.some((tag) =>
              userDietaryRestrictions.includes(tag),
            )
          ) {
            passesDietaryRestrictions = false;
            break;
          }
        }
      }
      if (!passesDietaryRestrictions) {
        continue;
      }

      // Verificar herramientas
      let hasAllTools = true;
      if (recipe.requiredTools && recipe.requiredTools.length > 0) {
        for (const requiredTool of recipe.requiredTools) {
          if (!userOwnedToolIds.includes(requiredTool.id)) {
            hasAllTools = false;
            break;
          }
        }
      }
      if (!hasAllTools) {
        continue;
      }

      suggestedRecipesDetailed.push({
        recipe,
        matchPercentage: parseFloat(matchPercentage.toFixed(2)),
        missingIngredients,
        availableUserIngredientsUsed,
      });
    }

    suggestedRecipesDetailed.sort(
      (a, b) => b.matchPercentage - a.matchPercentage,
    );

    this.logger.log(
      `Found ${suggestedRecipesDetailed.length} detailed recipe suggestions for user ID: ${userId}.`,
    );

    return {
      suggestedRecipes: suggestedRecipesDetailed,
      totalAvailableIngredients: availableIngredientIds.length,
      totalFoundRecipes: suggestedRecipesDetailed.length,
    };
  }

  async suggestRecipesByInventory(
    userId: string,
    suggestDto: SuggestRecipesDto,
  ): Promise<Recipe[]> {
    const detailedResponse = await this.suggestRecipesByInventoryDetailed(
      userId,
      suggestDto,
    );
    return detailedResponse.suggestedRecipes.map((sr) => sr.recipe);
  }

  async getRecipeInstructions(recipeId: string): Promise<{
    recipe: Recipe;
    totalTime: number;
    instructions: string[];
  }> {
    this.logger.log(`Getting instructions for recipe ${recipeId}`);

    const recipe = await this.findOne(recipeId);

    const totalTime = recipe.preparationTimeMinutes + recipe.cookingTimeMinutes;

    return {
      recipe,
      totalTime,
      instructions: recipe.steps,
    };
  }

  async createUserEditedRecipe(
    userId: string,
    editRecipeDto: EditUserRecipeDto,
  ): Promise<Recipe> {
    this.logger.log(`User ${userId} editing recipe ${editRecipeDto.recipeId}`);

    // Verificar que el usuario existe
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const originalRecipe = await this.findOne(editRecipeDto.recipeId);

    // Crear una nueva receta basada en la original
    const editedRecipe = this.recipeRepository.create({
      title: editRecipeDto.customTitle || `${originalRecipe.title} (Editada)`,
      description: `${originalRecipe.description} - Editada por ${user.name}`,
      preparationTimeMinutes: originalRecipe.preparationTimeMinutes,
      cookingTimeMinutes: originalRecipe.cookingTimeMinutes,
      servings: originalRecipe.servings,
      steps: editRecipeDto.modifiedSteps || originalRecipe.steps,
      requiredTools: originalRecipe.requiredTools,
    });

    editedRecipe.recipeIngredients = [];

    for (const originalRI of originalRecipe.recipeIngredients) {
      const substitution = editRecipeDto.ingredientSubstitutions?.find(
        (sub) => sub.originalIngredientId === originalRI.ingredient.id,
      );

      if (substitution) {
        const newIngredient = await this.ingredientRepository.findOneBy({
          id: substitution.newIngredientId,
        });

        if (!newIngredient) {
          throw new BadRequestException(
            `Ingrediente sustituto con ID "${substitution.newIngredientId}" no encontrado.`,
          );
        }

        const substitutedRI = this.recipeIngredientRepository.create({
          ingredient: newIngredient,
          quantity: substitution.quantity || originalRI.quantity,
          unit: substitution.unit || originalRI.unit,
          notes: substitution.notes || originalRI.notes,
        });

        editedRecipe.recipeIngredients.push(substitutedRI);
      } else {
        const copiedRI = this.recipeIngredientRepository.create({
          ingredient: originalRI.ingredient,
          quantity: originalRI.quantity,
          unit: originalRI.unit,
          notes: originalRI.notes,
        });

        editedRecipe.recipeIngredients.push(copiedRI);
      }
    }

    try {
      const savedRecipe = await this.recipeRepository.save(editedRecipe);
      this.logger.log(
        `User edited recipe "${savedRecipe.title}" (ID: ${savedRecipe.id}) created successfully.`,
      );
      return this.findOne(savedRecipe.id);
    } catch (error) {
      this.logger.error(
        `Error creating edited recipe: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error al crear la receta editada: ${error.message}`,
      );
    }
  }

  async suggestRecipesByUserInventory(userId: string): Promise<Recipe[]> {
    const detailedResponse =
      await this.suggestRecipesByUserInventoryDetailed(userId);
    return detailedResponse.suggestedRecipes.map((sr) => sr.recipe);
  }

  async suggestRecipesByUserInventoryDetailed(
    userId: string,
  ): Promise<SuggestRecipesResponseDto> {
    this.logger.log(
      `Getting user ingredients and suggesting recipes for user ID: ${userId}`,
    );

    const userIngredients = await this.userIngredientRepository.find({
      where: { user: { id: userId } },
      relations: ['ingredient'],
    });

    if (!userIngredients || userIngredients.length === 0) {
      this.logger.warn(
        `User with ID "${userId}" has no available ingredients.`,
      );
      throw new BadRequestException(
        'No tienes ingredientes disponibles. Primero selecciona tus ingredientes en /users/ingredients',
      );
    }

    const availableIngredientIds = userIngredients.map(
      (ui) => ui.ingredient.id,
    );

    this.logger.log(
      `Found ${availableIngredientIds.length} available ingredients for user ID: ${userId}: ${availableIngredientIds.join(', ')}`,
    );

    const suggestDto: SuggestRecipesDto = { availableIngredientIds };
    return this.suggestRecipesByInventoryDetailed(userId, suggestDto);
  }
}
