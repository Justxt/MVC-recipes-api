import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class IngredientSubstitutionDto {
  @IsUUID()
  originalIngredientId: string;

  @IsUUID()
  newIngredientId: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class EditUserRecipeDto {
  @IsOptional()
  @IsString()
  customTitle?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientSubstitutionDto)
  @IsOptional()
  ingredientSubstitutions?: IngredientSubstitutionDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  modifiedSteps?: string[];
}