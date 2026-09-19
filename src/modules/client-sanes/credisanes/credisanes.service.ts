import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Credisan } from './schemas/credisan.schema';
import { CreateCredisanDto } from './dto/create-credisan.dto';
import { UpdateCredisanDto } from './dto/update-credisan.dto';

@Injectable()
export class CredisanesService {
  constructor(
    @InjectModel(Credisan.name) private credisanModel: Model<Credisan>
  ) {}

  async create(tenantId: string, createCredisanDto: CreateCredisanDto) {
    try {
      // Solo creamos el San, los participantes se agregarán después manualmente
      const newCredisan = new this.credisanModel({
        ...createCredisanDto,
        tenantId: new Types.ObjectId(tenantId),
        status: 'DRAFT',
      });
      
      const savedCredisan = await newCredisan.save();

      return {
        message: 'San creado exitosamente en modo borrador.',
        credisan: savedCredisan,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al crear el San');
    }
  }

  async findAllByTenant(tenantId: string) {
    return this.credisanModel.find({ tenantId: new Types.ObjectId(tenantId) }).exec();
  }

  async findOne(tenantId: string, id: string) {
    const credisan = await this.credisanModel.findOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId)
    }).exec();

    if (!credisan) throw new NotFoundException('San no encontrado');
    return credisan;
  }

  async update(tenantId: string, id: string, updateDto: UpdateCredisanDto) {
    const credisan = await this.findOne(tenantId, id);
    if (credisan.status !== 'DRAFT') {
      throw new BadRequestException('No puedes modificar un San que ya está Activo o Finalizado');
    }
    return this.credisanModel.findByIdAndUpdate(id, { $set: updateDto }, { new: true }).exec();
  }

  async remove(tenantId: string, id: string) {
    const credisan = await this.findOne(tenantId, id);
    if (credisan.status !== 'DRAFT') {
      throw new BadRequestException('No puedes eliminar un San que ya tiene cuotas generadas. Debes cancelarlo.');
    }
    await this.credisanModel.findByIdAndDelete(id).exec();
    return { message: 'San eliminado correctamente' };
  }
}