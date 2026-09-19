import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Importamos los esquemas necesarios
import { TenantClient } from '../client-sanes/tenant-clients/schemas/tenant-client.schema';
import { Assignment } from '../client-sanes/assignments/schemas/assignment.schema';
import { Installment } from '../client-sanes/installments/schemas/installment.schema';
import { Tenant } from '../tenant-management/schemas/tenant.schema';

@Injectable()
export class ClientPortalService {
  constructor(
    @InjectModel(TenantClient.name) private tenantClientModel: Model<TenantClient>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Installment.name) private installmentModel: Model<Installment>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
  ) {}

  async getMyDashboard(userId: string) {
    // 1. Buscar en qué empresas (Tenants) está inscrito este usuario
    const clientProfiles = await this.tenantClientModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .exec();

    if (!clientProfiles.length) {
      return { activeSanes: [], message: 'No estás inscrito en ningún San actualmente.' };
    }

    const tenantClientIds = clientProfiles.map(profile => profile._id);

    // 2. Buscar sus asignaciones (puestos) y poblar los datos del San y la Empresa
    const assignments = await this.assignmentModel
      .find({ tenantClientId: { $in: tenantClientIds } })
      .populate('credisanId', 'name prizeType installmentAmount totalPositions frequency status')
      .exec();

    // 3. Buscar TODAS sus cuotas para armar su estado de cuenta
    const assignmentIds = assignments.map(a => a._id);
    const installments = await this.installmentModel
      .find({ assignmentId: { $in: assignmentIds } })
      .sort({ roundNumber: 1 }) // Ordenadas cronológicamente
      .exec();

    // 4. Buscar las tasas de cambio de las empresas involucradas
    const tenantIds = clientProfiles.map(profile => profile.tenantId);
    const tenants = await this.tenantModel
      .find({ _id: { $in: tenantIds } })
      .select('name currentExchangeRate')
      .exec();

    // Mapeo rápido de empresas para acceder a su nombre y tasa fácilmente
    const tenantMap = {};
    tenants.forEach(t => {
      tenantMap[t._id.toString()] = t;
    });
    
    // Mapeo de perfiles para saber a qué empresa pertenece cada asignación
    const profileMap = {};
    clientProfiles.forEach(p => {
      profileMap[p._id.toString()] = p.tenantId.toString();
    });

    // 5. Ensamblar la respuesta final estructurada para el Frontend
    const activeSanes = assignments.map(assignment => {
      // Relacionar la asignación con su empresa
      const tenantIdStr = profileMap[assignment.tenantClientId.toString()];
      const tenantData = tenantMap[tenantIdStr];

      // Filtrar solo las cuotas de esta asignación/san
      const myInstallments = installments.filter(
        inst => inst.assignmentId.toString() === assignment._id.toString()
      );

      // Calcular progreso (Ej: 2 de 10 cuotas pagadas)
      const paidCount = myInstallments.filter(i => i.status === 'PAID').length;

      return {
        tenantName: tenantData?.name || 'Empresa Desconocida',
        exchangeRate: tenantData?.currentExchangeRate || 1,
        sanDetails: assignment.credisanId,
        myPosition: assignment.positionNumber,
        progress: `${paidCount}/${myInstallments.length}`,
        installments: myInstallments,
      };
    });

    return { activeSanes };
  }
}