import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { FeedbackService } from './feedback.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeFeedback } from './entities/recipe-feedback.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Tool } from '../tools/entities/tool.entity';
import { User } from '../users/entities/user.entity';
import { UserIngredient } from '../users/entities/user-ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeIngredient,
      RecipeFeedback,
      Ingredient,
      Tool,
      User,
      UserIngredient,
    ]),
  ],
  controllers: [RecipesController],
  providers: [RecipesService, FeedbackService],
  exports: [RecipesService, FeedbackService],
})
export class RecipesModule {}
