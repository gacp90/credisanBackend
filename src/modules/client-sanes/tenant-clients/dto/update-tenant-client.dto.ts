import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantClientDto } from './create-tenant-client.dto';
import { IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export class UpdateTenantClientDto extends PartialType(CreateTenantClientDto) {
  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  strikes?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'VERIFIED', 'REJECTED'])
  kycStatus?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}