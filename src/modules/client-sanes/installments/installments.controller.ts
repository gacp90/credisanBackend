import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantRolesGuard } from '../../../common/guards/tenant-roles.guard';
import { RequireRole } from '../../../common/decorators/require-role.decorator';
import { InstallmentsService } from './installments.service';

@Controller('installments')
@UseGuards(JwtAuthGuard, TenantRolesGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  // Endpoint que consumirá el botón "Ver Pagos" de Angular
  @Get('assignment/:assignmentId')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async getByAssignment(@Param('assignmentId') assignmentId: string) {
    return this.installmentsService.findByAssignment(assignmentId);
  }

  // Endpoint para reportes globales
  @Get('credisan/:credisanId')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async getByCredisan(@Param('credisanId') credisanId: string) {
    return this.installmentsService.findByCredisan(credisanId);
  }
}