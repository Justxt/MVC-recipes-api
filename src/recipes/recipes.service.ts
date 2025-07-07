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
import { RecipeBuilder } from './builders/recipe.builder';
import { RecipeSuggestionContextService } from './services/recipe-suggestion-context.service';

interface SuggestRecipesDto {
  availableIngredientIds: string[];
}

interface SuggestedRecipeInfo extends Recipe {
  matchPercentage: number;
  missingIngredients?: { name: string; quantity: string; unit: string }[];
  availableUserIngredientsUsed?: string[];
}

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
    private readonly recipeBuilder: RecipeBuilder,
    private readonly recipeSuggestionContext: RecipeSuggestionContextService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const {
      recipeIngredients: recipeIngredientsDto,
      requiredToolIds,
      steps,
      ...recipeDetails
    } = createRecipeDto;

    this.logger.log(`Creating new recipe using Builder pattern: ${recipeDetails.title}`);

    try {
      const builder = this.recipeBuilder.createNew();
      
      builder
        .withBasicInfo(recipeDetails as any)
        .withSteps(steps);
      
      await builder.addIngredients(recipeIngredientsDto || []);
      await builder.addTools(requiredToolIds || []);
      
      const recipe = await builder.build();

      this.logger.log(`Recipe "${recipe.title}" (ID: ${recipe.id}) created successfully using Builder.`);
      return this.findOne(recipe.id);
    } catch (error) {
      this.logger.error(`Error creating recipe with Builder: ${error.message}`, error.stack);
      throw error;
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
      `Using Strategy pattern for detailed recipe suggestions - user ID: ${userId}`,
    );
    
    // Delegar al contexto de Strategy
    return this.recipeSuggestionContext.suggestByInventory(
      userId, 
      suggestDto.availableIngredientIds
    );
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
    recipeId: string,
    editRecipeDto: EditUserRecipeDto,
  ): Promise<Recipe> {
    this.logger.log(`User ${userId} editing recipe ${recipeId}`);

    // Verificar que el usuario existe
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const originalRecipe = await this.findOne(recipeId);

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
        `User with ID "${userId}" has no available ingredients. Returning empty suggestions.`,
      );
      return {
        suggestedRecipes: [],
        totalAvailableIngredients: 0,
        totalFoundRecipes: 0,
      };
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
