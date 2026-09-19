import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Credisan extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId; // Empresa organizadora

  @Prop({ required: true })
  name!: string; // Ej: "San Camioneta Hilux 2026" o "San Navideño $1000"

  @Prop({ type: String, enum: ['VEHICLE', 'CASH', 'ITEM'], required: true })
  prizeType!: string;

  @Prop({ required: true, min: 1 })
  installmentAmount!: number; // ¿De cuánto es la cuota? Ej: 50 ($50)

  @Prop({ required: true, min: 2 })
  totalPositions!: number; // Cantidad de participantes/puestos

  @Prop({ type: String, enum: ['WEEKLY', 'BIWEEKLY', 'MONTHLY'], required: true })
  frequency!: string; // Frecuencia de pago (Semanal, Quincenal, Mensual)

  @Prop({ required: true, min: 0 })
  graceDays!: number; // Días de gracia permitidos (0 si es estricto)

  @Prop({ type: Date })
  startDate!: Date; // Fecha ideal en la que se debe pagar la primera cuota (Puesto #1)

  @Prop({ type: String, enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'DRAFT' })
  status!: string;
}

export const CredisanSchema = SchemaFactory.createForClass(Credisan);

// Índice para hacer búsquedas rápidas de los sanes de una empresa específica
CredisanSchema.index({ tenantId: 1, status: 1 });