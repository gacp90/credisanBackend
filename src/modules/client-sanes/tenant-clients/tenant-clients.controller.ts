import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete, Query, Req } from '@nestjs/common';
import { TenantClientsService } from './tenant-clients.service';
import { CreateTenantClientDto } from './dto/create-tenant-client.dto';
import { UpdateTenantClientDto } from './dto/update-tenant-client.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantRolesGuard } from '../../../common/guards/tenant-roles.guard';
import { RequireRole } from '../../../common/decorators/require-role.decorator';
import { GetTenantId } from '../../../common/decorators/get-tenant-id.decorator';

@Controller('tenant-clients')
@UseGuards(JwtAuthGuard, TenantRolesGuard) 
export class TenantClientsController {
  constructor(private readonly tenantClientsService: TenantClientsService) {}

  @Post('enroll')
  @RequireRole('OWNER', 'ADMIN') 
  async enrollClient(
    @Body() createTenantClientDto: CreateTenantClientDto,
    @GetTenantId() tenantId: string, 
  ) {
    return this.tenantClientsService.enrollClientToTenant(tenantId, createTenantClientDto);
  }

  // NUEVO ENDPOINT PARA IMPORTACIÓN MASIVA
  @Post('bulk')
  @RequireRole('OWNER', 'ADMIN') // Ajusta según quién pueda subir excels
  
  async enrollBulk(
    @Req() req: any,
    @GetTenantId() tenantId: string,
    @Body() clientsData: CreateTenantClientDto[]
  ) {
    
    return this.tenantClientsService.enrollBulkClients(tenantId, clientsData);
  }

  @Get()
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async findAll(
    @GetTenantId() tenantId: string,
    @Query() queryParams: any // Capturamos todos los parámetros
  ) {
    return this.tenantClientsService.getClientsByTenant(tenantId, queryParams);
  }

  @Get(':id')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  async findOne(
    @Param('id') clientId: string,
    @GetTenantId() tenantId: string,
  ) {
    return this.tenantClientsService.getClientById(tenantId, clientId);
  }

  @Patch(':id')
  @RequireRole('OWNER', 'ADMIN') // Restringido para que un cajero común no edite datos sensibles
  async update(
    @Param('id') clientId: string,
    @Body() updateTenantClientDto: UpdateTenantClientDto,
    @GetTenantId() tenantId: string,
  ) {
    return this.tenantClientsService.updateClient(tenantId, clientId, updateTenantClientDto);
  }

  @Delete(':id')
  @RequireRole('OWNER', 'ADMIN') 
  async deactivate(
    @Param('id') clientId: string,
    @GetTenantId() tenantId: string,
  ) {
    return this.tenantClientsService.deactivateClient(tenantId, clientId);
  }
}