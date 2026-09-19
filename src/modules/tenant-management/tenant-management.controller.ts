import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// (Opcional) Si quieres que solo el OWNER edite la empresa, podrías usar aquí tu TenantRolesGuard

@UseGuards(JwtAuthGuard)
@Controller('tenant-management')
export class TenantManagementController {
  constructor(private readonly tenantManagementService: TenantManagementService) {}

  @Post()
  async create(@Req() req, @Body() createTenantDto: CreateTenantDto) {
    createTenantDto.ownerUserId = req.user.userId || req.user.sub;
    return this.tenantManagementService.createTenant(createTenantDto);
  }

  @Get('my-tenants')
  async getMyTenants(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    return this.tenantManagementService.getMyTenants(userId);
  }

  @Patch(':id')
  async update(@Param('id') tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantManagementService.updateTenant(tenantId, updateTenantDto);
  }

  @Delete(':id')
  async suspend(@Param('id') tenantId: string) {
    return this.tenantManagementService.suspendTenant(tenantId);
  }
}