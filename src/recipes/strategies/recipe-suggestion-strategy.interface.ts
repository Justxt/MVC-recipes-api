import { User } from '../../users/entities/user.entity';
import { SuggestRecipesResponseDto } from '../dto/suggested-recipe.dto';

export interface RecipeSuggestionStrategy {
  execute(
    userId: string,
    availableIngredientIds?: string[]
  ): Promise<SuggestRecipesResponseDto>;
} 