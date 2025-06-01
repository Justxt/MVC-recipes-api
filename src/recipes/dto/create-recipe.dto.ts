import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  ArrayNotEmpty,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto';

export class CreateRecipeDto {
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  title: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  description?: string;

  @IsInt({ message: 'El tiempo de preparación debe ser un número entero.' })
  @Min(0, { message: 'El tiempo de preparación no puede ser negativo.' })
  @IsOptional()
  preparationTimeMinutes?: number;

  @IsInt({ message: 'El tiempo de cocción debe ser un número entero.' })
  @Min(0, { message: 'El tiempo de cocción no puede ser negativo.' })
  @IsOptional()
  cookingTimeMinutes?: number;

  @IsInt({ message: 'Las porciones deben ser un número entero.' })
  @Min(1, { message: 'Debe haber al menos 1 porción.' })
  @IsOptional()
  servings?: number;

  @IsArray({ message: 'Los ingredientes de la receta deben ser un arreglo.' })
  @ArrayNotEmpty({ message: 'La receta debe tener al menos un ingrediente.' })
  @ValidateNested({
    each: true,
    message: 'Cada ingrediente de la receta debe ser válido.',
  })
  @Type(() => CreateRecipeIngredientDto)
  recipeIngredients: CreateRecipeIngredientDto[];
}
