import { Module } from '@nestjs/common';


import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethod, PaymentMethodSchema } from './schemas/payment-method.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // 3. ESTO ES LO QUE FALTA: Registrar el modelo
    MongooseModule.forFeature([
      { name: PaymentMethod.name, schema: PaymentMethodSchema }
    ])
  ],
  providers: [PaymentMethodsService],
  controllers: [PaymentMethodsController],
  exports: [PaymentMethodsService]
})
export class PaymentMethodsModule {}
