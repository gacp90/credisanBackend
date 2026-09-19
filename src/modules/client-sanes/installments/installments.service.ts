import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Installment } from './schemas/installment.schema';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectModel(Installment.name) private installmentModel: Model<Installment>,
  ) {}

  // Busca todas las cuotas de un cliente específico en un San
  async findByAssignment(assignmentId: string) {
    return this.installmentModel.find({
      assignmentId: new Types.ObjectId(assignmentId)
    })
    .sort({ roundNumber: 1 }) // Ordenadas de la 1 a la 11
    .exec();
  }

  // Opcional: Busca TODAS las cuotas de un San (útil para un futuro reporte general)
  async findByCredisan(credisanId: string) {
    return this.installmentModel.find({
      credisanId: new Types.ObjectId(credisanId)
    })
    .sort({ assignmentId: 1, roundNumber: 1 })
    .exec();
  }
}