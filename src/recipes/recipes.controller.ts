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
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { FeedbackService } from './feedback.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { SuggestRecipesDto } from './dto/suggest-recipes.dto';
import { SuggestRecipesResponseDto } from './dto/suggested-recipe.dto';
import { EditUserRecipeDto } from './dto/edit-user-recipe.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeFeedback } from './entities/recipe-feedback.entity';

@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post()
  @HttpCode(201)
  async createRecipe(
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.create(createRecipeDto);
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

  @Get(':id/instructions')
  @HttpCode(200)
  async getRecipeInstructions(@Param('id', ParseUUIDPipe) id: string): Promise<{
    recipe: Recipe;
    totalTime: number;
    instructions: string[];
  }> {
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
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

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
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    return this.recipesService.suggestRecipesByInventoryDetailed(
      userId,
      suggestRecipesDto,
    );
  }

  @Post('edit-recipe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createUserEditedRecipe(
    @Req() req,
    @Body() editRecipeDto: EditUserRecipeDto,
  ): Promise<Recipe> {
    const userId = req.user.id;

    if (!userId) {
      throw new Error('Usuario no autenticado correctamente.');
    }

    return this.recipesService.createUserEditedRecipe(userId, editRecipeDto);
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createFeedback(
    @Req() req,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<RecipeFeedback> {
    const userId = req.user.id;

    if (!userId) {
      throw new Error('Usuario no autenticado correctamente.');
    }

    return this.feedbackService.createFeedback(userId, createFeedbackDto);
  }

  @Get(':id/feedback')
  @HttpCode(200)
  async getRecipeFeedback(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RecipeFeedback[]> {
    return this.feedbackService.getRecipeFeedback(id);
  }

  @Get(':id/average-rating')
  @HttpCode(200)
  async getAverageRating(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ averageRating: number }> {
    const averageRating = await this.feedbackService.getAverageRating(id);
    return { averageRating };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Req() req,
  ): Promise<Recipe> {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<void> {
    return this.recipesService.remove(id);
  }

  @Post('suggest-by-my-inventory')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async suggestRecipesByMyInventory(@Req() req): Promise<Recipe[]> {
    const userId = req.user.id;

    if (!userId) {
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    return this.recipesService.suggestRecipesByUserInventory(userId);
  }

  @Post('suggest-by-my-inventory-detailed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async suggestRecipesByMyInventoryDetailed(@Req() req): Promise<SuggestRecipesResponseDto> {
    const userId = req.user.id;

    if (!userId) {
      throw new Error(
        'Usuario no autenticado correctamente para obtener sugerencias.',
      );
    }

    return this.recipesService.suggestRecipesByUserInventoryDetailed(userId);
  }
}
