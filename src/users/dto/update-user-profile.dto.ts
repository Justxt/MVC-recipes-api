import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsOptional()
  name?: string;

  @IsArray({
    message: 'Las restricciones alimentarias deben ser un arreglo de textos.',
  })
  @IsString({
    each: true,
    message: 'Cada restricción alimentaria debe ser un texto.',
  })
  @IsOptional()
  dietary_restrictions?: string[];

  @IsString({ message: 'El nivel de cocina debe ser un texto.' })
  @IsOptional()
  cooking_level?: string;

  @IsArray({ message: 'Las herramientas deben ser un arreglo de IDs.' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de herramienta debe ser un UUID válido.',
  })
  @IsOptional()
  ownedToolIds?: string[];
}
