import { IsArray, IsUUID } from 'class-validator';

export class UpdateUserIngredientsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ingredientIds: string[];
} 