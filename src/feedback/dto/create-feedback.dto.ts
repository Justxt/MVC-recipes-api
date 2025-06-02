import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rate: number;

  @IsOptional()
  @IsString()
  comment?: string;
}