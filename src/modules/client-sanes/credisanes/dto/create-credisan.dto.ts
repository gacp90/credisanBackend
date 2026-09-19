import { IsNotEmpty, IsString, IsNumber, IsEnum, Min, IsDateString, IsOptional } from 'class-validator';

enum PrizeType { VEHICLE = 'VEHICLE', CASH = 'CASH', ITEM = 'ITEM' }
enum Frequency { WEEKLY = 'WEEKLY', BIWEEKLY = 'BIWEEKLY', MONTHLY = 'MONTHLY' }

export class CreateCredisanDto {
  @IsNotEmpty({ message: 'El nombre del San es obligatorio' })
  @IsString()
  name!: string;

  @IsEnum(PrizeType, { message: 'El tipo de premio debe ser VEHICLE, CASH o ITEM' })
  prizeType!: PrizeType;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'La cuota debe ser mayor a 0' })
  installmentAmount!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2, { message: 'Debe haber al menos 2 puestos' })
  totalPositions!: number;

  @IsEnum(Frequency, { message: 'La frecuencia debe ser WEEKLY, BIWEEKLY o MONTHLY' })
  frequency!: Frequency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  graceDays?: number = 0; // Si no lo envían, por defecto es 0

  @IsNotEmpty({ message: 'La fecha de inicio de cobros es obligatoria' })
  @IsDateString({}, { message: 'Formato de fecha inválido (Use YYYY-MM-DD)' })
  startDate!: string;
}