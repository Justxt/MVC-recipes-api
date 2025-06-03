import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { SuggestRecipesDto } from './dto/suggest-recipes.dto';
import { SuggestRecipesResponseDto } from './dto/suggested-recipe.dto';
import { EditUserRecipeDto } from './dto/edit-user-recipe.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
export class RecipesController {
  private readonly logger = new Logger(RecipesController.name);

  constructor(private readonly recipesService: RecipesService) {}
  @Post()
  @HttpCode(201)
  async createRecipe(
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    this.logger.log(`Creating recipe: ${createRecipeDto.title}`);
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Recipe[]> {
    this.logger.log('Fetching all recipes');
    return this.recipesService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Recipe> {
    this.logger.log(`Fetching recipe with ID: ${id}`);
    return this.recipesService.findOne(id);
  }

  @Get(':id/instructions')
  @HttpCode(200)
  async getRecipeInstructions(@Param('id', ParseUUIDPipe) id: string): Promise<{
    recipe: Recipe;
    totalTime: number;
    instructions: string[];
  }> {
    this.logger.log(`Getting instructions for recipe ID: ${id}`);
    return this.recipesService.getRecipeInstructions(id);
  }

  @Post('suggest-by-inventory')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async suggestRecipes(
    @Req() req,
    @Body() suggestRecipesDto: SuggestRecipesDto,
  ): Promise<Recipe[]> {
    const userId = req.user.id;

    if (!userId) {
      this.logger.error(
        'User not authenticated properly for recipe suggestions',
      );
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    this.logger.log(`Getting recipe suggestions for user ID: ${userId}`);
    return this.recipesService.suggestRecipesByInventory(
      userId,
      suggestRecipesDto,
    );
  }
  @Post('suggest-by-inventory-detailed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async suggestRecipesDetailed(
    @Req() req,
    @Body() suggestRecipesDto: SuggestRecipesDto,
  ): Promise<SuggestRecipesResponseDto> {
    const userId = req.user.id;

    if (!userId) {
      this.logger.error(
        'User not authenticated properly for detailed recipe suggestions',
      );
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    this.logger.log(`Getting detailed recipe suggestions for user ${userId}`);
    return this.recipesService.suggestRecipesByInventoryDetailed(
      userId,
      suggestRecipesDto,
    );
  }
  @Post(':recipeId/edit-recipe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createUserEditedRecipe(
    @Param('recipeId', ParseUUIDPipe) recipeId: string,
    @Req() req,
    @Body() editRecipeDto: EditUserRecipeDto,
  ): Promise<Recipe> {
    const userId = req.user.id;

    if (!userId) {
      this.logger.error('User not authenticated properly for recipe editing');
      throw new Error('Usuario no autenticado correctamente.');
    }

    this.logger.log(
      `Creating edited recipe for user ${userId}, base recipe ${recipeId}`,
    );
    return this.recipesService.createUserEditedRecipe(
      userId,
      recipeId,
      editRecipeDto,
    );
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Req() req,
  ): Promise<Recipe> {
    this.logger.log(`Updating recipe with ID: ${id}`);
    return this.recipesService.update(id, updateRecipeDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    this.logger.log(`Deleting recipe with ID: ${id}`);
    return this.recipesService.remove(id);
  }
  @Post('suggest-by-my-inventory')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async suggestRecipesByMyInventory(@Req() req): Promise<Recipe[]> {
    const userId = req.user.id;

    if (!userId) {
      this.logger.error(
        'User not authenticated properly for inventory-based suggestions',
      );
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    this.logger.log(
      `Getting recipe suggestions based on user ${userId} inventory`,
    );
    return this.recipesService.suggestRecipesByUserInventory(userId);
  }
  @Post('suggest-by-my-inventory-detailed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async suggestRecipesByMyInventoryDetailed(
    @Req() req,
  ): Promise<SuggestRecipesResponseDto> {
    const userId = req.user.id;

    if (!userId) {
      this.logger.error(
        'User not authenticated properly for detailed inventory-based suggestions',
      );
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    this.logger.log(
      `Getting detailed recipe suggestions based on user ${userId} inventory`,
    );
    return this.recipesService.suggestRecipesByUserInventoryDetailed(userId);
  }
}
