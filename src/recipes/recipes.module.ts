import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, RecipeIngredient]),
    IngredientsModule,
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService, TypeOrmModule],
})
export class RecipesModule {}
