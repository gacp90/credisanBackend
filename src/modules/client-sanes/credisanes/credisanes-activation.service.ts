import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import dayjs from 'dayjs';

import { Credisan } from './schemas/credisan.schema';
import { Assignment } from '../assignments/schemas/assignment.schema';
import { Installment } from '../installments/schemas/installment.schema';
import { Transaction } from 'src/modules/finances/transactions/schemas/transaction.schema';

@Injectable()
export class CredisanesActivationService {
  constructor(
    @InjectModel(Credisan.name) private credisanModel: Model<Credisan>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Installment.name) private installmentModel: Model<Installment>,
    @InjectModel(Transaction.name) private transactionModel: Model<any>,
    @InjectConnection() private readonly connection: Connection, 
  ) {}

  async activateSan(tenantId: string, credisanId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const credisan = await this.credisanModel.findOne(
        { _id: new Types.ObjectId(credisanId), tenantId: new Types.ObjectId(tenantId), status: 'DRAFT' },
        null, { session }
      );

      if (!credisan) throw new BadRequestException('El San no existe o ya está activo');

      const assignments = await this.assignmentModel.find({ credisanId: credisan._id }, null, { session });
      
      // Validamos que estén los clientes completos
      if (assignments.length !== credisan.totalPositions) {
        throw new BadRequestException(`Faltan o sobran participantes. Esperados: ${credisan.totalPositions}`);
      }

      const installmentsToInsert: Partial<Installment>[] = [];
      const startDate = dayjs(credisan.startDate);

      // CRÍTICO: Sumamos 1 a las posiciones totales para cobrarle a los clientes la ganancia del dueño
      const totalRoundsToPay = credisan.totalPositions + 1;

      for (let round = 1; round <= totalRoundsToPay; round++) {
        let dueDate = startDate;
        if (round > 1) {
          if (credisan.frequency === 'WEEKLY') dueDate = startDate.add((round - 1) * 7, 'day');
          if (credisan.frequency === 'BIWEEKLY') dueDate = startDate.add((round - 1) * 15, 'day');
          if (credisan.frequency === 'MONTHLY') dueDate = startDate.add(round - 1, 'month');
        }

        const graceDate = dueDate.add(credisan.graceDays, 'day');

        for (const assignment of assignments) {
          installmentsToInsert.push({
            credisanId: credisan._id,
            assignmentId: assignment._id,
            roundNumber: round,
            amount: credisan.installmentAmount,
            dueDate: dueDate.toDate(),
            graceDate: graceDate.toDate(),
            status: 'PENDING'
          });
        }
      }

      await this.installmentModel.insertMany(installmentsToInsert, { session });
      credisan.status = 'ACTIVE';
      await credisan.save({ session });

      await session.commitTransaction();
      
      return {
        message: '¡El San ha sido activado! Calendario de cuotas generado.',
        totalInstallmentsGenerated: installmentsToInsert.length
      };

    } catch (error) {
      await session.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Fallo crítico al activar el San.');
    } finally {
      session.endSession();
    }
  }

  // NUEVO MÉTODO: Hace el sorteo 1 a 1 cuando el dueño decida
  async executeDraw(credisanId: string, currentRoundNumber: number, preselectedAssignmentId?: string) {
    // 1. Buscamos TODOS los participantes elegibles (que aún no tienen puesto)
    const eligibleParticipants = await this.assignmentModel.find({ 
      credisanId: new Types.ObjectId(credisanId),
      positionNumber: null 
    });

    if (eligibleParticipants.length === 0) {
      throw new BadRequestException('Ya no hay participantes elegibles para sorteo.');
    }

    let winner;

    // 2. Lógica de selección
    if (preselectedAssignmentId) {
      // OPCIÓN 2: El administrador preseleccionó un ganador por seguridad
      winner = eligibleParticipants.find(p => p._id.toString() === preselectedAssignmentId);
      
      if (!winner) {
        // Validamos por seguridad: si enviaron un ID de alguien que ya ganó o que no pertenece a este San.
        throw new BadRequestException('El participante seleccionado no es válido o ya tiene un puesto asignado en este San.');
      }
    } else {
      // OPCIÓN 1: Sorteo 100% Aleatorio (Lógica original)
      const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
      winner = eligibleParticipants[randomIndex];
    }

    // 3. Adjudicar el premio
    winner.positionNumber = currentRoundNumber;
    await winner.save();

    return {
      message: preselectedAssignmentId 
        ? `Adjudicación directa exitosa. La ronda ${currentRoundNumber} ha sido asignada.`
        : `¡Sorteo aleatorio exitoso! La ronda ${currentRoundNumber} ha sido adjudicada.`,
      winnerId: winner.tenantClientId, // Mantenemos la compatibilidad con tu frontend actual
      assignmentId: winner._id,        // Devolvemos esto por si lo necesitas
      isRandom: !preselectedAssignmentId // Bandera útil por si el frontend quiere mostrar un confeti diferente
    };
  }

  // --- CASO 1: REVOCAR PUESTO DE UN PARTICIPANTE (LIBERAR CUPO) ---
  async revokeDrawPosition(credisanId: string, assignmentId: string) {
    const assignment = await this.assignmentModel.findOne({
      _id: new Types.ObjectId(assignmentId),
      credisanId: new Types.ObjectId(credisanId),
    });

    if (!assignment) {
      throw new NotFoundException('Participación no encontrada en este San.');
    }

    if (assignment.positionNumber === null) {
      throw new BadRequestException('Este participante aún no tiene un puesto asignado.');
    }

    // TODO: Null no permitido
    const previousPosition = assignment.positionNumber;
    assignment.positionNumber = null!;
    await assignment.save();

    return {
      message: `El puesto #${previousPosition} ha sido liberado correctamente y está disponible para sortear nuevamente.`,
      assignment,
    };
  }

  // --- CASO 2: REEMPLAZAR PARTICIPANTE (CESIÓN DE CUPO) ---
  async replaceParticipant(
    credisanId: string,
    assignmentId: string,
    newTenantClientId: string,
  ) {
    const assignment = await this.assignmentModel.findOne({
      _id: new Types.ObjectId(assignmentId),
      credisanId: new Types.ObjectId(credisanId),
    });

    if (!assignment) {
      throw new NotFoundException('La asignación que intentas modificar no existe.');
    }

    const newClientObjectId = new Types.ObjectId(newTenantClientId);

    // Validar que no sea exactamente la misma persona
    if (assignment.tenantClientId.toString() === newTenantClientId) {
      throw new BadRequestException('El cliente seleccionado ya es el titular de este cupo.');
    }

    try {
      // 1. Actualizar el titular en la Asignación (conservando su positionNumber si ya tenía)
      assignment.tenantClientId = newClientObjectId as any;
      await assignment.save();

      // 2. Obtener todas las cuotas (Installments) de este cupo
      const installments = await this.installmentModel.find({
        assignmentId: assignment._id,
      });

      const installmentIds = installments.map((inst) => inst._id);

      // 3. Actualizar tenantClientId en las cuotas (si tu schema de Installment guarda este campo)
      await this.installmentModel.updateMany(
        { assignmentId: assignment._id },
        { $set: { tenantClientId: newClientObjectId } },
      );

      // 4. Traspasar todos los pagos/transacciones históricas y pendientes al nuevo cliente
      if (installmentIds.length > 0) {
        await this.transactionModel.updateMany(
          { installmentId: { $in: installmentIds } },
          { $set: { tenantClientId: newClientObjectId } },
        );
      }

      return {
        message: 'Participante reemplazado con éxito. Todas las cuotas y pagos históricos fueron transferidos.',
        assignment: await assignment.populate({
          path: 'tenantClientId',
          populate: { path: 'userId', select: '-password' },
        }),
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Este cliente ya está inscrito en este San y no puede duplicarse.');
      }
      throw error;
    }
  }
}