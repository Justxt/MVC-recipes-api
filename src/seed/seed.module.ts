import { Module } from '@nestjs/common';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { Tool } from 'src/tools/entities/tool.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, Tool, Recipe])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
