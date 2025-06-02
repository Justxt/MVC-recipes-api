import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  name: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña не puede estar vacía.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

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
}
