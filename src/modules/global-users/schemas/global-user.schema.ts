import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Agrega automáticamente createdAt y updatedAt
export class GlobalUser extends Document {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, unique: true })
  cedula!: string; // Único, previene suplantación de identidad

  @Prop({ required: true })
  countryCode!: string; // Ej: '+58'

  @Prop({ required: true })
  phoneNumber!: string; // Ej: '4141234567' (Único por país, vital para WhatsApp)

  @Prop()
  address!: string;

  @Prop({ type: [String], default: [] })
  fcmTokens!: string[]; // Para futuras notificaciones Push de la app

  @Prop({ default: true })
  isActive!: boolean;
}

// Generamos el Schema para Mongoose
export const GlobalUserSchema = SchemaFactory.createForClass(GlobalUser);

// Creamos un índice compuesto único para countryCode + phoneNumber
// Así garantizamos que no haya dos usuarios con el mismo número de WhatsApp
GlobalUserSchema.index({ countryCode: 1, phoneNumber: 1 }, { unique: true });