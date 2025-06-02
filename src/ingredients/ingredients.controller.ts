import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Logger } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Controller('ingredients')
export class IngredientsController {
  private readonly logger = new Logger(IngredientsController.name);

  constructor(private readonly ingredientsService: IngredientsService) {}
  @Post()
  @HttpCode(201)
  create(@Body() createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    this.logger.log(`Creating ingredient: ${createIngredientDto.name}`);
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll(): Promise<Ingredient[]> {
    this.logger.log('Fetching all ingredients');
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ingredient> {
    this.logger.log(`Fetching ingredient with ID: ${id}`);
    return this.ingredientsService.findOne(id);
  }
}
