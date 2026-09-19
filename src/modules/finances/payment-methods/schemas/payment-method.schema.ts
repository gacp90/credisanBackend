import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentMethod extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string; // Ej: "Pago Móvil Banesco", "Zelle Empresa", "Binance Pay"

  @Prop({ required: true })
  currency!: string; // Ej: 'VES', 'USD', 'USDT', 'COP'

  @Prop({ type: Object, default: {} })
  details!: Record<string, any>; // { phone: '0414...', id: 'V123...', bank: 'Banesco' }

  @Prop({ type: Number, default: 1 }) // Por defecto 1 (si todo es en dólares)
  currentExchangeRate!: number;

  // NUEVO: Para que en el frontend puedas mostrar "Tasa actualizada a las 9:00 AM"
  @Prop({ type: Date, default: Date.now })
  exchangeRateUpdatedAt!: Date;

  @Prop({ default: true })
  isActive!: boolean; // Vital para el Soft Delete
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);

// Índice para búsquedas rápidas por empresa
PaymentMethodSchema.index({ tenantId: 1, isActive: 1 });