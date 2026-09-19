import { Module } from '@nestjs/common';
import { CredisanesService } from './credisanes.service';
import { CredisanesController } from './credisanes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Credisan, CredisanSchema } from './schemas/credisan.schema';
import { CredisanesActivationService } from './credisanes-activation.service';
import { Installment, InstallmentSchema } from '../installments/schemas/installment.schema';
import { Assignment, AssignmentSchema } from '../assignments/schemas/assignment.schema';
import { AssignmentsController } from '../assignments/assignments.controller';
import { AssignmentsService } from '../assignments/assignments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Credisan.name, schema: CredisanSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Installment.name, schema: InstallmentSchema },
    ])
  ],
  providers: [CredisanesService, CredisanesActivationService, AssignmentsService],
  controllers: [CredisanesController, AssignmentsController],
  exports: [CredisanesService, CredisanesActivationService]
})
export class CredisanesModule {}
