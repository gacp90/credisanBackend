import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Assignment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Credisan', required: true })
  credisanId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TenantClient', required: true })
  tenantClientId!: Types.ObjectId; // El perfil del cliente en la empresa

  // El número de puesto. (Ej: 1 para la empresa, 2 al N para los clientes)
  // Lo permitimos nulo al inicio porque se asigna al azar al momento de "Activar"
  @Prop({ type: Number, default: null }) 
  positionNumber!: number; 
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);