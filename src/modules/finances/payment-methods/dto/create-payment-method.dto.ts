import { IsNotEmpty, IsString, IsObject, IsOptional, Min, IsNumber } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsNotEmpty({ message: 'El nombre del método es obligatorio' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'La moneda es obligatoria (Ej: VES, USD)' })
  @IsString()
  currency!: string;

  @IsNumber()
  @Min(0.1, { message: 'La tasa debe ser mayor a 0' })
  currentExchangeRate!: number;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}