import { Recipe } from '../entities/recipe.entity';

export class SuggestedRecipeDto {
  recipe: Recipe;
  matchPercentage: number;
  missingIngredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];
  availableUserIngredientsUsed: string[];
}

export class SuggestRecipesResponseDto {
  suggestedRecipes: SuggestedRecipeDto[];
  totalAvailableIngredients: number;
  totalFoundRecipes: number;
} 