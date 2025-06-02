import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  password: string;
}
