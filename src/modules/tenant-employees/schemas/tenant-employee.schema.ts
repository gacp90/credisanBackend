import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TenantEmployee extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GlobalUser', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: ['OWNER', 'ADMIN', 'CASHIER'], required: true })
  role!: string;

  @Prop({ default: false })
  wp!: boolean;

  @Prop({ type: String, default: null })
  internalApiKey!: string;


  @Prop({ default: true })
  isActive!: boolean;
}

export const TenantEmployeeSchema = SchemaFactory.createForClass(TenantEmployee);

// Índice compuesto: Evita que el mismo usuario sea creado dos veces como empleado en la misma empresa
TenantEmployeeSchema.index({ tenantId: 1, userId: 1 }, { unique: true });