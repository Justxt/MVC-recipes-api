import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateRecipeIngredientDto {
  @IsUUID('4', { message: 'El ID del ingrediente debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del ingrediente no puede estar vacío.' })
  ingredientId: string;

  @IsString({ message: 'La cantidad debe ser un texto.' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  @MinLength(1, { message: 'La cantidad debe tener al menos 1 caracter.' })
  quantity: string;

  @IsString({ message: 'La unidad debe ser un texto.' })
  @IsNotEmpty({ message: 'La unidad no puede estar vacía.' })
  @MinLength(1, { message: 'La unidad debe tener al menos 1 caracter.' })
  unit: string;

  @IsString({ message: 'Las notas deben ser un texto.' })
  @IsOptional()
  notes?: string;
}
