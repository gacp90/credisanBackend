import { PartialType } from '@nestjs/mapped-types';
import { CreateCredisanDto } from './create-credisan.dto';

// PartialType toma todas las propiedades de CreateCredisanDto 
// y las convierte automáticamente en opcionales.
export class UpdateCredisanDto extends PartialType(CreateCredisanDto) {}