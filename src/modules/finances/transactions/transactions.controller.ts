import { Controller, Post, Body, Param, Get, Query, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ReportTransactionDto } from './dto/report-transaction.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantRolesGuard } from '../../../common/guards/tenant-roles.guard';
import { RequireRole } from '../../../common/decorators/require-role.decorator';
import { GetTenantId } from '../../../common/decorators/get-tenant-id.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard, TenantRolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('report')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async reportPayment(@Body() dto: ReportTransactionDto, @GetTenantId() tenantId: string) {
    return this.transactionsService.reportPayment(tenantId, dto);
  }

  @Post(':id/process')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async processPayment(
    @Param('id') transactionId: string,
    @Body() dto: ConfirmTransactionDto,
    @GetTenantId() tenantId: string,
    @Request() req: any,
  ) {
    // req.user.userId contiene el ID del empleado que está haciendo la confirmación (Viene del JWT)
    return this.transactionsService.processTransaction(tenantId, transactionId, req.user.userId, dto);
  }

  @Get()
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async getTransactions(@Query() query: any, @GetTenantId() tenantId: string) {
    return this.transactionsService.getTransactions(tenantId, query);
  }
}