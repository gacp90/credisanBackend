import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsMongoId()
  tenantClientId!: string;
}