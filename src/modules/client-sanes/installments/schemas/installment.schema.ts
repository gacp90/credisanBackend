import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Installment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Credisan', required: true })
  credisanId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assignment', required: true })
  assignmentId!: Types.ObjectId; // A qué puesto/cliente pertenece esta cuota

  @Prop({ required: true })
  roundNumber!: number; // La ronda de cobro (Ej: Ronda 1, Ronda 2)

  @Prop({ required: true })
  amount!: number; // El monto a pagar

  @Prop({ required: true })
  dueDate!: Date; // Fecha de vencimiento ideal

  @Prop({ required: true })
  graceDate!: Date; // Fecha límite real con días de gracia incluidos

  @Prop({ type: String, enum: ['PENDING', 'PAID', 'LATE', 'DEFAULTED'], default: 'PENDING' })
  status!: string;

  // Si el cliente paga, aquí guardaremos el ID del comprobante/transacción
  @Prop({ type: Types.ObjectId, ref: 'Payment', default: null })
  paymentId!: Types.ObjectId;

  // NUEVO: Para guardar el historial de abonos parciales
  @Prop({ default: 0 })
  amountPaid!: number;

  // NUEVO: Memoria para los pagos que están en proceso de verificación
  @Prop({ default: 0 })
  amountPending!: number;
}

export const InstallmentSchema = SchemaFactory.createForClass(Installment);

// Índices para búsquedas rápidas (Vital para reportes)
InstallmentSchema.index({ credisanId: 1, status: 1 });
InstallmentSchema.index({ assignmentId: 1, roundNumber: 1 });