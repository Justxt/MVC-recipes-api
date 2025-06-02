import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class SuggestRecipesDto {
  @IsArray({
    message: 'Los IDs de ingredientes disponibles deben ser un arreglo.',
  })
  @ArrayNotEmpty({
    message: 'Debes proporcionar al menos un ID de ingrediente disponible.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de ingrediente debe ser un UUID válido.',
  })
  availableIngredientIds: string[];
}
