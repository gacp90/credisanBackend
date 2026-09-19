import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTenantClientDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  cedula!: string;

  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}