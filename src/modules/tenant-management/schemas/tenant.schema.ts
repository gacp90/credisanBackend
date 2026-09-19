import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true })
  name!: string; // Ej: "Inversiones Sanes Caracas"

  @Prop({ required: true, unique: true })
  rif!: string; // Registro de Información Fiscal (Si aplica en Venezuela) o ID fiscal

  @Prop()
  address!: string; // Dirección física

  @Prop({ default: 'ACTIVE' })
  status!: string; // 'ACTIVE', 'SUSPENDED' (por falta de pago tuyo, por ejemplo)

  // Aquí podrías agregar en el futuro la configuración de WhatsApp
  @Prop({ type: Object, default: {} })
  whatsappConfig!: {
    phoneNumberId?: string;
    accessToken?: string;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);