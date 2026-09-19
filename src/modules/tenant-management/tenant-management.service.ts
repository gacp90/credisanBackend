import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEmployee } from '../tenant-employees/schemas/tenant-employee.schema';

@Injectable()
export class TenantManagementService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(TenantEmployee.name) private tenantEmployeeModel: Model<TenantEmployee>,
  ) {}

  // --- CREATE ---
  async createTenant(createTenantDto: CreateTenantDto) {
    const { ownerUserId, ...tenantData } = createTenantDto;
    try {
      const createdTenant = new this.tenantModel(tenantData);
      const savedTenant = await createdTenant.save();

      const newOwner = new this.tenantEmployeeModel({
        tenantId: savedTenant._id,
        userId: new Types.ObjectId(ownerUserId),
        role: 'OWNER',
        isActive: true,
      });
      await newOwner.save();

      return { message: 'Empresa creada exitosamente', tenant: savedTenant };
    } catch (error: any) {
      if (error.code === 11000) throw new ConflictException('Ya existe una empresa registrada con ese RIF');
      throw new InternalServerErrorException('Error al crear la empresa');
    }
  }

  // --- READ ALL (Mis Empresas) ---
  async getMyTenants(userId: string) {
    // Buscamos todas las relaciones laborales del usuario y poblamos los datos de la empresa
    const employments = await this.tenantEmployeeModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .populate('tenantId') 
      .exec();

    // Extraemos y retornamos solo el arreglo de empresas con el rol que tiene el usuario allí
    return employments.map(emp => ({
      role: emp.role,
      ...(emp.tenantId as any)._doc 
    }));
  }

  // --- UPDATE ---
  async updateTenant(tenantId: string, updateDto: UpdateTenantDto) {
    const updatedTenant = await this.tenantModel.findByIdAndUpdate(
      tenantId,
      { $set: updateDto },
      { new: true }
    );
    if (!updatedTenant) throw new NotFoundException('Empresa no encontrada');
    return updatedTenant;
  }

  // --- DELETE (Soft Delete / Suspensión) ---
  async suspendTenant(tenantId: string) {
    const suspended = await this.tenantModel.findByIdAndUpdate(
      tenantId,
      { status: 'SUSPENDED' },
      { new: true }
    );
    if (!suspended) throw new NotFoundException('Empresa no encontrada');
    return { message: 'Empresa suspendida', tenant: suspended };
  }

  async getRolesForUser(userId: string) {
    const employments = await this.tenantEmployeeModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .select('tenantId role internalApiKey wp') // Solo traemos lo necesario para el JWT
      .lean()
      .exec();
  
    return employments;
  }
}