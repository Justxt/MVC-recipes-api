import { Injectable } from '@nestjs/common';
import { Recipe } from '../entities/recipe.entity';

export interface RecipeFactory {
  createRecipe(type: RecipeType): Recipe;
}

export enum RecipeType {
  QUICK = 'quick',
  GOURMET = 'gourmet',
  HEALTHY = 'healthy',
  STANDARD = 'standard'
}

@Injectable()
export class ConcreteRecipeFactory implements RecipeFactory {
  createRecipe(type: RecipeType): Recipe {
    const recipe = new Recipe();
    
    switch (type) {
      case RecipeType.QUICK:
        recipe.preparationTimeMinutes = 15;
        recipe.cookingTimeMinutes = 15;
        break;
      case RecipeType.GOURMET:
        recipe.preparationTimeMinutes = 60;
        recipe.cookingTimeMinutes = 120;
        break;
      case RecipeType.HEALTHY:
        recipe.preparationTimeMinutes = 30;
        recipe.cookingTimeMinutes = 45;
        break;
      default:
        recipe.preparationTimeMinutes = 30;
        recipe.cookingTimeMinutes = 60;
    }
    
    return recipe;
  }
} 