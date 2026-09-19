import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TenantClient', required: true })
  tenantClientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Installment', required: true })
  installmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PaymentMethod', required: true })
  paymentMethodId!: Types.ObjectId;

  @Prop({ required: true })
  baseAmount!: number; // Monto en la divisa original del San

  @Prop({ required: true })
  paidAmount!: number; // Monto transferido (Ej: en Bolívares)

  @Prop({ required: true })
  exchangeRate!: number; // Tasa aplicada

  @Prop({ required: true })
  reference!: string;

  @Prop({ type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'GlobalUser', default: null })
  verifiedBy!: Types.ObjectId; // El ID del empleado que confirmó

  @Prop({ type: String, default: null })
  rejectionReason!: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ tenantId: 1, createdAt: -1 });
TransactionSchema.index({ tenantId: 1, status: 1 });