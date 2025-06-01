import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Recipe } from './entities/recipe.entity';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @HttpCode(201)
  async createRecipe(
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.createRecipe(createRecipeDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Recipe[]> {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Recipe> {
    return this.recipesService.findOne(id);
  }
}
