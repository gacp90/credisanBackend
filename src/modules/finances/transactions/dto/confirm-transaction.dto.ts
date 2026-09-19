import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

enum TransactionAction {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL'
}

export class ConfirmTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionAction)
  action!: TransactionAction;

  @IsOptional()
  @IsString()
  rejectionReason?: string; // Obligatorio solo si la acción es CANCEL
}