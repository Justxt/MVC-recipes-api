import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { RecipeBuilder } from '../builders/recipe.builder';

@Injectable()
export class RecipeCrudService {
  private readonly logger = new Logger(RecipeCrudService.name);

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    private readonly recipeBuilder: RecipeBuilder,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const {
      recipeIngredients: recipeIngredientsDto,
      requiredToolIds,
      steps,
      ...recipeDetails
    } = createRecipeDto;

    this.logger.log(`Creating new recipe: ${recipeDetails.title}`);

    try {
      const builder = this.recipeBuilder.createNew();
      
      builder
        .withBasicInfo(recipeDetails as any)
        .withSteps(steps);
      
      await builder.addIngredients(recipeIngredientsDto || []);
      await builder.addTools(requiredToolIds || []);
      
      const recipe = await builder.build();
      
      this.logger.log(`Recipe "${recipe.title}" (ID: ${recipe.id}) created successfully.`);
      return this.findOne(recipe.id);
    } catch (error) {
      this.logger.error(`Error creating recipe: ${error.message}`, error.stack);
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
    this.logger.log(`Updating recipe with ID: ${id}`);
    
    const recipe = await this.findOne(id);
    // Por ahora, solo notificamos
    return recipe;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing recipe with ID: ${id}`);
    
    const recipe = await this.findOne(id);
    await this.recipeRepository.remove(recipe);

    this.logger.log(`Recipe with ID: ${id} removed successfully.`);
  }
} 