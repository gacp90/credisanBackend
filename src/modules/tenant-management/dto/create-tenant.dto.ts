import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'El RIF o documento de la empresa es obligatorio' })
  @IsString()
  rif!: string;

  @IsOptional()
  @IsString()
  address?: string;

  // IMPORTANTE: Necesitamos saber a qué GlobalUser asignarle el rol de OWNER
  @IsOptional()
  @IsString()
  ownerUserId?: string; 
}