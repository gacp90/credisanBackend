import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentMethod } from './schemas/payment-method.schema';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethod>,
  ) {}

  // CREAR
  async create(tenantId: string, dto: CreatePaymentMethodDto) {
    const newMethod = new this.paymentMethodModel({
      ...dto,
      tenantId: new Types.ObjectId(tenantId),
    });
    return newMethod.save();
  }

  // LEER TODOS (Por defecto solo los activos, a menos que se pidan todos)
  async findAll(tenantId: string, includeInactive = false) {
    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (!includeInactive) {
      filter.isActive = true;
    }
    return this.paymentMethodModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  // LEER UNO
  async findOne(tenantId: string, id: string) {
    const method = await this.paymentMethodModel.findOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    }).exec();

    if (!method) throw new NotFoundException('Método de pago no encontrado');
    return method;
  }

  // ACTUALIZAR
  async update(tenantId: string, id: string, dto: UpdatePaymentMethodDto) {
    const updatedMethod = await this.paymentMethodModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
      { $set: dto },
      { new: true } // Devuelve el documento ya modificado
    ).exec();

    if (!updatedMethod) throw new NotFoundException('Método de pago no encontrado');
    return updatedMethod;
  }

  // BORRADO LÓGICO (Soft Delete)
  async remove(tenantId: string, id: string) {
    const method = await this.paymentMethodModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
      { $set: { isActive: false } },
      { new: true }
    ).exec();

    if (!method) throw new NotFoundException('Método de pago no encontrado');
    return { message: 'Método de pago desactivado exitosamente', method };
  }
}