import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateIngredientDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  name: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Las etiquetas deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser un texto.' })
  @IsOptional()
  tags?: string[];

  @IsUrl({}, { message: 'La URL de la imagen debe ser una URL válida.' })
  @IsOptional()
  imageUrl?: string;
}
