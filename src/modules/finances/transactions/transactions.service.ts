import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Installment } from '../../client-sanes/installments/schemas/installment.schema';
import { ReportTransactionDto } from './dto/report-transaction.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Installment.name) private installmentModel: Model<Installment>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // 1. Reportar el pago (Queda en PENDING)
  async reportPayment(tenantId: string, dto: ReportTransactionDto) {
    const transaction = new this.transactionModel({
      ...dto,
      tenantId: new Types.ObjectId(tenantId),
      tenantClientId: new Types.ObjectId(dto.tenantClientId),
      installmentId: new Types.ObjectId(dto.installmentId),
      paymentMethodId: new Types.ObjectId(dto.paymentMethodId),
      status: 'PENDING',
    });

    // NUEVO: Sumamos el monto al saldo 'en revisión' de la cuota
    await this.installmentModel.findByIdAndUpdate(
      dto.installmentId,
      { $inc: { amountPending: dto.baseAmount } }
    );

    return transaction.save();
  }

  // 2. Confirmar o Rechazar (Transacción segura)
  async processTransaction(tenantId: string, transactionId: string, employeeId: string, dto: ConfirmTransactionDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Buscar la transacción
      const transaction = await this.transactionModel.findOne(
        { _id: new Types.ObjectId(transactionId), tenantId: new Types.ObjectId(tenantId), status: 'PENDING' },
        null,
        { session }
      );

      if (!transaction) throw new NotFoundException('Transacción no encontrada o ya procesada');

      if (dto.action === 'CANCEL') {
        transaction.status = 'CANCELLED';
        transaction.rejectionReason = dto.rejectionReason!;
        transaction.verifiedBy = new Types.ObjectId(employeeId);
        await transaction.save({ session });
        
        // NUEVO: Si se rechaza, restamos ese dinero del saldo pendiente
        await this.installmentModel.findByIdAndUpdate(
          transaction.installmentId, 
          { $inc: { amountPending: -transaction.baseAmount } }, 
          { session }
        );

        await session.commitTransaction();
        return { message: 'Transacción anulada correctamente' };
      }

      // Si es CONFIRM, procedemos a actualizar transacción y cuota
      transaction.status = 'CONFIRMED';
      transaction.verifiedBy = new Types.ObjectId(employeeId);
      await transaction.save({ session });

      const installment = await this.installmentModel.findOne({ _id: transaction.installmentId }, null, { session });
      if (!installment) throw new BadRequestException('La cuota asociada no existe');

      // MODIFICADO: Sumamos a lo pagado y restamos de lo pendiente
      installment.amountPaid += transaction.baseAmount;
      installment.amountPending -= transaction.baseAmount; 
      if (installment.amountPending < 0) installment.amountPending = 0; // Seguridad

      if (installment.amountPaid >= installment.amount) {
        installment.status = 'PAID';
        installment.amountPaid = installment.amount;
      }

      installment.paymentId = transaction._id as Types.ObjectId;
      await installment.save({ session });

      await session.commitTransaction();
      return { message: 'Pago confirmado y saldo de cuota actualizado exitosamente' };

    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error crítico al procesar el pago');
    } finally {
      session.endSession();
    }
  }

  // 3. Listar transacciones con filtros (Para tu vista de reportes)
  async getTransactions(tenantId: string, query: any) {
    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    
    if (query.status) filter.status = query.status;
    if (query.paymentMethodId) filter.paymentMethodId = new Types.ObjectId(query.paymentMethodId);
    
    // Rango de fechas
    if (query.startDate && query.endDate) {
      filter.createdAt = { 
        $gte: new Date(query.startDate), 
        $lte: new Date(query.endDate + 'T23:59:59.999Z') // Hasta el final del día
      };
    }

    return this.transactionModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: 'tenantClientId', populate: { path: 'userId', select: 'fullName cedula' } }) // Trae nombre real
      .populate('paymentMethodId', 'name currency') 
      // Traemos la cuota y el nombre del San
      .populate({ path: 'installmentId', populate: { path: 'credisanId', select: 'name' } }) 
      .exec();
  }
}