import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}
  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    this.logger.log(`Creating ingredient: ${createIngredientDto.name}`);
    const existIngredient = await this.ingredientRepository.findOne({
      where: { name: createIngredientDto.name },
    });

    if (existIngredient) {
      this.logger.warn(`Ingredient creation failed: ${createIngredientDto.name} already exists`);
      throw new ConflictException('The ingredient already exists');
    }

    const ingredient = this.ingredientRepository.create(createIngredientDto);
    const savedIngredient = await this.ingredientRepository.save(ingredient);
    this.logger.log(`Ingredient created successfully: ${savedIngredient.name} with ID: ${savedIngredient.id}`);
    return savedIngredient;
  }
  async findAll(): Promise<Ingredient[]> {
    this.logger.verbose('Fetching all ingredients');
    const ingredients = await this.ingredientRepository.find();
    this.logger.verbose(`Found ${ingredients.length} ingredients`);
    return ingredients;
  }

  async findOne(id: string): Promise<Ingredient> {
    this.logger.verbose(`Finding ingredient with ID: ${id}`);
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
    });
    if (!ingredient) {
      this.logger.warn(`Ingredient not found with ID: ${id}`);
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }
    this.logger.verbose(`Ingredient found: ${ingredient.name}`);
    return ingredient;
  }
}
