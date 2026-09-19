import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TenantClient extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId; // A qué empresa pertenece este perfil

  @Prop({ type: Types.ObjectId, ref: 'GlobalUser', required: true })
  userId!: Types.ObjectId; // Quién es la persona (ID de GlobalUser)

  // Calificación del cliente dentro de esta empresa específica
  @Prop({ type: Number, default: 5, min: 1, max: 5 })
  rating!: number; 

  // Amonestaciones (ej: retrasos en pagos en esta empresa)
  @Prop({ type: Number, default: 0 })
  strikes!: number; 

  // Proceso Conozca a su Cliente (Validación de identidad presencial)
  @Prop({ type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' })
  kycStatus!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TenantClientSchema = SchemaFactory.createForClass(TenantClient);

// Índice compuesto: Evita que la misma empresa registre dos veces al mismo usuario global
TenantClientSchema.index({ tenantId: 1, userId: 1 }, { unique: true });