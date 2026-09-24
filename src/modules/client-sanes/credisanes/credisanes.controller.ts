import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CredisanesService } from './credisanes.service';
import { CredisanesActivationService } from './credisanes-activation.service';
import { CreateCredisanDto } from './dto/create-credisan.dto';
import { UpdateCredisanDto } from './dto/update-credisan.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantRolesGuard } from '../../../common/guards/tenant-roles.guard';
import { RequireRole } from '../../../common/decorators/require-role.decorator';
import { GetTenantId } from '../../../common/decorators/get-tenant-id.decorator';

@Controller('credisanes')
@UseGuards(JwtAuthGuard, TenantRolesGuard)
export class CredisanesController {
  constructor(
    private readonly credisanesService: CredisanesService,
    private readonly activationService: CredisanesActivationService,
  ) {}

  @Post()
  @RequireRole('OWNER', 'ADMIN')
  async create(@Body() createDto: CreateCredisanDto, @GetTenantId() tenantId: string) {
    return this.credisanesService.create(tenantId, createDto);
  }

  @Get()
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async findAll(@GetTenantId() tenantId: string) {
    return this.credisanesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async findOne(@Param('id') id: string, @GetTenantId() tenantId: string) {
    return this.credisanesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequireRole('OWNER', 'ADMIN')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCredisanDto, @GetTenantId() tenantId: string) {
    return this.credisanesService.update(tenantId, id, updateDto);
  }

  @Delete(':id')
  @RequireRole('OWNER', 'ADMIN')
  async remove(@Param('id') id: string, @GetTenantId() tenantId: string) {
    return this.credisanesService.remove(tenantId, id);
  }

  @Post(':id/activate')
  @RequireRole('OWNER', 'ADMIN')
  async activateSan(@Param('id') credisanId: string, @GetTenantId() tenantId: string) {
    return this.activationService.activateSan(tenantId, credisanId);
  }

  // RUTA PARA EL SORTEO
  @Post(':id/draw')
  @RequireRole('OWNER', 'ADMIN')
  async executeDraw(
    @Param('id') credisanId: string, 
    @Body('roundNumber') roundNumber: number,
    @Body('preselectedAssignmentId') preselectedAssignmentId?: string // <-- NUEVO PARÁMETRO OPCIONAL
  ) {
    return this.activationService.executeDraw(credisanId, roundNumber, preselectedAssignmentId);
  }
}