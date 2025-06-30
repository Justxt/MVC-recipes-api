import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Tool } from '../../tools/entities/tool.entity';
import { CreateRecipeIngredientDto } from '../dto/create-recipe-ingredient.dto';

@Injectable()
export class RecipeBuilder {
  private readonly logger = new Logger(RecipeBuilder.name);
  private recipe: Recipe;

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
  ) {
    this.reset();
  }

  private reset(): RecipeBuilder {
    this.recipe = this.recipeRepository.create({
      recipeIngredients: [],
      requiredTools: [],
      steps: [],
    });
    return this;
  }

  withBasicInfo(data: {
    title: string;
    description: string;
    preparationTimeMinutes: number;
    cookingTimeMinutes: number;
    servings: number;
    imageUrl?: string;
  }): RecipeBuilder {
    this.logger.verbose(`Setting basic info for recipe: ${data.title}`);
    
    this.recipe.title = data.title;
    this.recipe.description = data.description;
    this.recipe.preparationTimeMinutes = data.preparationTimeMinutes;
    this.recipe.cookingTimeMinutes = data.cookingTimeMinutes;
    this.recipe.servings = data.servings;
    return this;
  }

  withSteps(steps: string[]): RecipeBuilder {
    this.logger.verbose(`Adding ${steps.length} steps to recipe`);
    this.recipe.steps = [...steps];
    return this;
  }

  async addIngredients(ingredientsDto: CreateRecipeIngredientDto[]): Promise<RecipeBuilder> {
    if (!ingredientsDto || ingredientsDto.length === 0) {
      return this;
    }

    this.logger.verbose(`Adding ${ingredientsDto.length} ingredients to recipe`);

    for (const ingredientDto of ingredientsDto) {
      const ingredient = await this.ingredientRepository.findOneBy({
        id: ingredientDto.ingredientId,
      });
      
      if (!ingredient) {
        this.logger.error(`Ingredient with ID "${ingredientDto.ingredientId}" not found`);
        throw new BadRequestException(
          `Ingrediente con ID "${ingredientDto.ingredientId}" no encontrado.`,
        );
      }

      const recipeIngredient = this.recipeIngredientRepository.create({
        ingredient: ingredient,
        quantity: ingredientDto.quantity,
        unit: ingredientDto.unit,
        notes: ingredientDto.notes,
      });

      this.recipe.recipeIngredients.push(recipeIngredient);
    }

    return this;
  }

  async addTools(toolIds: string[]): Promise<RecipeBuilder> {
    if (!toolIds || toolIds.length === 0) {
      return this;
    }

    this.logger.verbose(`Adding ${toolIds.length} tools to recipe`);

    const tools = await this.toolRepository.findBy({
      id: In(toolIds),
    });

    if (tools.length !== toolIds.length) {
      this.logger.error(`Some tool IDs not found: ${toolIds}`);
      throw new BadRequestException(
        'Uno o más IDs de herramientas proporcionados no son válidos.',
      );
    }

    this.recipe.requiredTools = tools;
    return this;
  }

  async build(): Promise<Recipe> {
    this.logger.log(`Building recipe: ${this.recipe.title}`);

    if (!this.recipe.title || !this.recipe.description) {
      throw new BadRequestException(
        'El título y la descripción son obligatorios para crear una receta.',
      );
    }

    if (this.recipe.recipeIngredients.length === 0) {
      throw new BadRequestException(
        'Una receta debe tener al menos un ingrediente.',
      );
    }

    try {
      const savedRecipe = await this.recipeRepository.save(this.recipe);
      this.logger.log(`Recipe "${savedRecipe.title}" built successfully with ID: ${savedRecipe.id}`);
      
      // Reset builder para próximo uso
      this.reset();
      
      return savedRecipe;
    } catch (error) {
      this.logger.error(`Error building recipe: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al crear la receta: ${error.message}`);
    }
  }

  // Creamos una nueva instancia del builder
  createNew(): RecipeBuilder {
    return new RecipeBuilder(
      this.recipeRepository,
      this.recipeIngredientRepository,
      this.ingredientRepository,
      this.toolRepository,
    );
  }
} 