import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantRolesGuard } from '../../../common/guards/tenant-roles.guard';
import { RequireRole } from '../../../common/decorators/require-role.decorator';
import { GetTenantId } from '../../../common/decorators/get-tenant-id.decorator';

@Controller('credisanes/:credisanId/assignments')
@UseGuards(JwtAuthGuard, TenantRolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @RequireRole('OWNER', 'ADMIN') // El cajero no debería decidir quién entra al San
  async addClient(
    @Param('credisanId') credisanId: string,
    @Body() createDto: CreateAssignmentDto,
    @GetTenantId() tenantId: string
  ) {
    return this.assignmentsService.addClientToSan(credisanId, tenantId, createDto);
  }

  @Get()
  @RequireRole('OWNER', 'ADMIN', 'CASHIER') // El cajero sí necesita ver la lista
  async getAssignments(@Param('credisanId') credisanId: string) {
    return this.assignmentsService.getAssignmentsBySan(credisanId);
  }

  @Delete(':assignmentId')
  @RequireRole('OWNER', 'ADMIN')
  async removeClient(
    @Param('credisanId') credisanId: string,
    @Param('assignmentId') assignmentId: string
  ) {
    return this.assignmentsService.removeClientFromSan(assignmentId, credisanId);
  }
}