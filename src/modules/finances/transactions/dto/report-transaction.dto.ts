import { IsNotEmpty, IsNumber, IsString, IsMongoId, Min } from 'class-validator';

export class ReportTransactionDto {
  @IsNotEmpty()
  @IsMongoId()
  tenantClientId!: string;

  @IsNotEmpty()
  @IsMongoId()
  installmentId!: string;

  @IsNotEmpty()
  @IsMongoId()
  paymentMethodId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  baseAmount!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  paidAmount!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  exchangeRate!: number;

  @IsNotEmpty()
  @IsString()
  reference!: string;
}