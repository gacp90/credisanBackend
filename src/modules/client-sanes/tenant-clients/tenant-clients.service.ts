import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TenantClient } from './schemas/tenant-client.schema';
import { GlobalUser } from '../../global-users/schemas/global-user.schema'; 
import { CreateTenantClientDto } from './dto/create-tenant-client.dto';
import { UpdateTenantClientDto } from './dto/update-tenant-client.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantClientsService {
  constructor(
    @InjectModel(TenantClient.name) private tenantClientModel: Model<TenantClient>,
    @InjectModel(GlobalUser.name) private globalUserModel: Model<GlobalUser>, 
  ) {}

  // --- CREATE ---
  async enrollClientToTenant(tenantId: string, createDto: CreateTenantClientDto) {
    try {
      let user = await this.globalUserModel.findOne({
        $or: [{ email: createDto.email }, { cedula: createDto.cedula }]
      });

      if (!user) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('12345678', salt);

        user = new this.globalUserModel({
          fullName: createDto.fullName,
          email: createDto.email,
          cedula: createDto.cedula,
          countryCode: createDto.countryCode,
          phoneNumber: createDto.phoneNumber,
          password: hashedPassword,
        });
        await user.save();
      }

      const newClient = new this.tenantClientModel({
        tenantId: new Types.ObjectId(tenantId),
        userId: user._id,
        kycStatus: 'PENDING',
      });

      const savedClient = await newClient.save();
      return await savedClient.populate('userId', '-password');

    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Esta persona ya es cliente de esta empresa o hay un conflicto de datos únicos.');
      }
      throw new InternalServerErrorException('Error al inscribir al cliente');
    }
  }

  // --- BULK CREATE (DESDE EXCEL/JSON) ---
  async enrollBulkClients(tenantId: string, clientsData: CreateTenantClientDto[]) {
    const results = {
      totalProcessed: clientsData.length,
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Usamos for...of para que se ejecute secuencialmente. 
    // Esto evita bloqueos de base de datos si el mismo usuario viene repetido 2 veces en el Excel.
    for (let i = 0; i < clientsData.length; i++) {
      const dto = clientsData[i];
      
      try {
        // 1. Validaciones mínimas de seguridad
        if (!dto.cedula && !dto.email) {
          throw new Error('El registro no tiene cédula ni correo electrónico.');
        }

        // 2. Buscamos si el GlobalUser ya existe
        let user = await this.globalUserModel.findOne({
          $or: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.cedula ? [{ cedula: dto.cedula }] : [])
          ]
        });

        // 3. Si no existe, lo creamos
        if (!user) {
          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash('12345678', salt);

          user = new this.globalUserModel({
            fullName: dto.fullName || 'Sin Nombre',
            email: dto.email,
            cedula: dto.cedula,
            countryCode: dto.countryCode || '+58',
            phoneNumber: dto.phoneNumber,
            password: hashedPassword,
          });
          await user.save();
        }

        // 4. Inscribimos al usuario en la empresa (Tenant)
        const newClient = new this.tenantClientModel({
          tenantId: new Types.ObjectId(tenantId),
          userId: user._id,
          kycStatus: 'PENDING',
        });

        await newClient.save();
        results.successful++;

      } catch (error: any) {
        // Si entra aquí, este cliente en particular falló, pero el ciclo continúa
        results.failed++;
        
        let errorMsg = error.message;
        
        // Error de duplicidad (ya era cliente de esta empresa)
        if (error.code === 11000) {
          errorMsg = 'Esta persona ya se encuentra registrada como cliente en esta empresa.';
        }

        // Guardamos el detalle para que el frontend lo muestre en una tabla
        results.errors.push({
          filaExcel: i + 1, // +1 porque los arrays empiezan en 0
          cliente: dto.fullName || dto.cedula || 'Registro desconocido',
          motivo: errorMsg
        });
      }
    }

    return results;
  }

  // --- READ ALL ---
  async getClientsByTenant(tenantId: string, queryParams: any) {
    const { search, limit = 10, page = 1, sortBy = 'newest' } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);

    const pipeline: any[] = [
      { $match: { tenantId: new Types.ObjectId(tenantId) } },
      {
        $lookup: {
          from: 'globalusers', // Mongoose pluraliza "GlobalUser" a "globalusers" por defecto en la BD
          localField: 'userId',
          foreignField: '_id',
          as: 'userId' // Sobrescribimos el campo temporalmente para simular el populate()
        }
      },
      { $unwind: '$userId' } // Extrae el objeto del arreglo generado por el lookup
    ];

    // Aplicar Regex si hay término de búsqueda
    if (search) {
      const regex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'userId.fullName': regex },
            { 'userId.cedula': regex },
            { 'userId.phoneNumber': regex }
          ]
        }
      });
    }

    // Ordenamiento
    let sortQuery: any = { createdAt: -1 };
    if (sortBy === 'oldest') sortQuery = { createdAt: 1 };
    if (sortBy === 'asc') sortQuery = { 'userId.fullName': 1 };
    if (sortBy === 'desc') sortQuery = { 'userId.fullName': -1 };
    pipeline.push({ $sort: sortQuery });

    // Paginación y conteo total
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: Number(limit) }]
      }
    });

    const result = await this.tenantClientModel.aggregate(pipeline).exec();
    const items = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    return { items, total };
  }

  // --- READ ONE ---
  async getClientById(tenantId: string, clientId: string) {
    const client = await this.tenantClientModel.findOne({
      _id: new Types.ObjectId(clientId),
      tenantId: new Types.ObjectId(tenantId),
    }).populate('userId', '-password').exec();

    if (!client) {
      throw new NotFoundException('Cliente no encontrado en el directorio de esta empresa');
    }
    return client;
  }

  // --- UPDATE ---
  async updateClient(tenantId: string, clientId: string, updateDto: UpdateTenantClientDto) {
    const client = await this.getClientById(tenantId, clientId);

    // 1. Actualizar datos personales en el GlobalUser (Si se enviaron)
    if (updateDto.fullName || updateDto.phoneNumber || updateDto.countryCode) {
      await this.globalUserModel.findByIdAndUpdate(client.userId._id, {
        ...(updateDto.fullName && { fullName: updateDto.fullName }),
        ...(updateDto.phoneNumber && { phoneNumber: updateDto.phoneNumber }),
        ...(updateDto.countryCode && { countryCode: updateDto.countryCode }),
      });
    }

    // 2. Actualizar datos de la relación con la empresa (TenantClient)
    const tenantUpdates = {
      ...(updateDto.kycStatus && { kycStatus: updateDto.kycStatus }),
      ...(updateDto.rating !== undefined && { rating: updateDto.rating }),
      ...(updateDto.strikes !== undefined && { strikes: updateDto.strikes }),
      ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
    };

    if (Object.keys(tenantUpdates).length > 0) {
      await this.tenantClientModel.updateOne({ _id: client._id }, { $set: tenantUpdates });
    }

    // Retornamos el documento fresco y poblado
    return this.getClientById(tenantId, clientId);
  }

  // --- DELETE (Soft Delete / Desactivar) ---
  async deactivateClient(tenantId: string, clientId: string) {
    const client = await this.tenantClientModel.findOneAndUpdate(
      { _id: new Types.ObjectId(clientId), tenantId: new Types.ObjectId(tenantId) },
      { isActive: false },
      { new: true }
    ).populate('userId', '-password');

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return { message: 'Cliente desactivado correctamente', client };
  }
}