import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstallmentsController } from './installments.controller';
import { InstallmentsService } from './installments.service';
import { Installment, InstallmentSchema } from './schemas/installment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Installment.name, schema: InstallmentSchema }])
  ],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService, MongooseModule] // Exportamos por si otro módulo lo necesita
})
export class InstallmentsModule {}