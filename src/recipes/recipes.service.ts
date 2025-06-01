import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { Repository } from 'typeorm';
import { IngredientsService } from 'src/ingredients/ingredients.service';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async createRecipe(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const { recipeIngredients, ...recipeData } = createRecipeDto;

    const recipe = this.recipeRepository.create(recipeData);

    if (recipeIngredients && RecipeIngredient.length > 0) {
      const recipeIngredientsEntity: RecipeIngredient[] = [];
      for (const ingredientDto of recipeIngredients) {
        const ingredient = await this.ingredientRepository.findOne({
          where: { id: ingredientDto.ingredientId },
        });

        if (!ingredient) {
          throw new NotFoundException(
            `Ingredient with ID "${ingredientDto.ingredientId}" not found`,
          );
        }

        const recipeIngredient = new RecipeIngredient();
        recipeIngredient.ingredient = ingredient;
        recipeIngredient.quantity = ingredientDto.quantity;
        recipeIngredient.unit = ingredientDto.unit;
        recipeIngredient.notes = ingredientDto.notes;
        recipeIngredientsEntity.push(recipeIngredient);
      }

      recipe.recipeIngredients = recipeIngredientsEntity;
    } else {
      recipe.recipeIngredients = [];
    }

    try {
      return this.recipeRepository.save(recipe);
    } catch (error) {
      throw new BadRequestException(`Error creating recipe: ${error.message}`);
    }
  }

  async findAll(): Promise<Recipe[]> {
    return this.recipeRepository.find({
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
    });
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }
    return recipe;
  }
}
