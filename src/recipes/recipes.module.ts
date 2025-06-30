import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { RecipeBuilder } from './builders/recipe.builder';
import { InventoryMatchStrategy } from './strategies/inventory-match-strategy.service';
import { RecipeSuggestionContextService } from './services/recipe-suggestion-context.service';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Tool } from '../tools/entities/tool.entity';
import { User } from '../users/entities/user.entity';
import { UserIngredient } from '../users/entities/user-ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeIngredient,
      Ingredient,
      Tool,
      User,
      UserIngredient,
    ]),
  ],
  controllers: [RecipesController],
  providers: [
    RecipesService,
    RecipeBuilder,
    InventoryMatchStrategy,
    RecipeSuggestionContextService,
  ],
  exports: [RecipesService, RecipeBuilder, RecipeSuggestionContextService],
})
export class RecipesModule {}
