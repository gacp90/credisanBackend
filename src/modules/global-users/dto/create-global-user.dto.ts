import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsNumberString, MaxLength } from 'class-validator';

export class CreateGlobalUserDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString()
  fullName!: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsNotEmpty({ message: 'La cédula es obligatoria' })
  @IsNumberString({}, { message: 'La cédula debe contener solo números' })
  cedula!: string;

  @IsNotEmpty({ message: 'El código de país es obligatorio' })
  @IsString()
  @Matches(/^\d{1,4}$/, { message: 'El código de país debe contener solo números' })
  countryCode!: string;

  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  @IsNumberString({}, { message: 'El teléfono debe contener solo números' })
  @MinLength(8, { message: 'El teléfono es muy corto' })
  @MaxLength(15, { message: 'El teléfono es muy largo' })
  phoneNumber!: string;
}