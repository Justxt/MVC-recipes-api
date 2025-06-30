import { Injectable, Logger } from '@nestjs/common';
import { RecipeSuggestionStrategy } from '../strategies/recipe-suggestion-strategy.interface';
import { InventoryMatchStrategy } from '../strategies/inventory-match-strategy.service';
import { SuggestRecipesResponseDto } from '../dto/suggested-recipe.dto';

@Injectable()
export class RecipeSuggestionContextService {
  private readonly logger = new Logger(RecipeSuggestionContextService.name);

  constructor(
    private readonly inventoryMatchStrategy: InventoryMatchStrategy,
  ) {}

  async suggestByInventory(
    userId: string,
    availableIngredientIds?: string[]
  ): Promise<SuggestRecipesResponseDto> {
    this.logger.log(`Using inventory match strategy for user ${userId}`);
    return this.inventoryMatchStrategy.execute(userId, availableIngredientIds);
  }

  async suggestByPreferences(
    userId: string,
    strategy?: RecipeSuggestionStrategy
  ): Promise<SuggestRecipesResponseDto> {
    if (strategy) {
      this.logger.log(`Using custom strategy for user ${userId}`);
      return strategy.execute(userId);
    }
    
    return this.suggestByInventory(userId);
  }
} 