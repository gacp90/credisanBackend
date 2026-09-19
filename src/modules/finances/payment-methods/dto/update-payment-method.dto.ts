import { IsString, IsObject, IsOptional, IsBoolean, Min, IsNumber } from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
  
  @IsOptional()
  @IsNumber()
  @Min(0.1, { message: 'La tasa debe ser mayor a 0' })
  currentExchangeRate!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}