import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment } from './schemas/assignment.schema';
import { Credisan } from '../credisanes/schemas/credisan.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Credisan.name) private credisanModel: Model<Credisan>,
  ) {}

  async addClientToSan(credisanId: string, tenantId: string, createDto: CreateAssignmentDto) {
    const credisan = await this.credisanModel.findOne({ 
      _id: new Types.ObjectId(credisanId), 
      tenantId: new Types.ObjectId(tenantId) 
    });

    if (!credisan) throw new NotFoundException('San no encontrado');
    if (credisan.status !== 'DRAFT') throw new BadRequestException('Solo puedes agregar participantes a un San en modo Borrador');

    // Validar el límite de cupos
    const currentCount = await this.assignmentModel.countDocuments({ credisanId: credisan._id });
    if (currentCount >= credisan.totalPositions) {
      throw new BadRequestException('El San ya ha alcanzado el límite de participantes');
    }

    try {
      const newAssignment = new this.assignmentModel({
        credisanId: credisan._id,
        tenantClientId: new Types.ObjectId(createDto.tenantClientId)
      });
      return await newAssignment.save();
    } catch (error: any) {
      if (error.code === 11000) throw new ConflictException('Este cliente ya está inscrito en este San');
      throw error;
    }
  }

  async getAssignmentsBySan(credisanId: string) {
    return this.assignmentModel.find({ credisanId: new Types.ObjectId(credisanId) })
      // Poblamos de forma anidada: Assignment -> TenantClient -> GlobalUser
      .populate({
        path: 'tenantClientId',
        populate: { path: 'userId', select: 'fullName email cedula phoneNumber countryCode' } 
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async removeClientFromSan(assignmentId: string, credisanId: string) {
    const credisan = await this.credisanModel.findById(credisanId);
    if (credisan?.status !== 'DRAFT') {
      throw new BadRequestException('No puedes remover clientes de un San que ya está Activo');
    }

    await this.assignmentModel.findByIdAndDelete(assignmentId).exec();
    return { message: 'Cliente removido del San exitosamente' };
  }
}