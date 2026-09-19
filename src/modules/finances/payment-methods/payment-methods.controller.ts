import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantRolesGuard } from '../../../common/guards/tenant-roles.guard';
import { RequireRole } from '../../../common/decorators/require-role.decorator';
import { GetTenantId } from '../../../common/decorators/get-tenant-id.decorator';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard, TenantRolesGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @RequireRole('OWNER', 'ADMIN') // Cajeros no pueden crear cuentas bancarias
  create(@Body() dto: CreatePaymentMethodDto, @GetTenantId() tenantId: string) {
    return this.paymentMethodsService.create(tenantId, dto);
  }

  @Get()
  @RequireRole('OWNER', 'ADMIN', 'CASHIER') // Cajeros SÍ pueden ver la lista para cobrar
  findAll(@GetTenantId() tenantId: string, @Query('all') all?: boolean) {
    // Si mandan ?all=true en la URL, trae los inactivos también
    return this.paymentMethodsService.findAll(tenantId, Boolean(all));
  }

  @Get(':id')
  @RequireRole('OWNER', 'ADMIN', 'CASHIER')
  findOne(@Param('id') id: string, @GetTenantId() tenantId: string) {
    return this.paymentMethodsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequireRole('OWNER', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
    @GetTenantId() tenantId: string
  ) {
    return this.paymentMethodsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @RequireRole('OWNER', 'ADMIN')
  remove(@Param('id') id: string, @GetTenantId() tenantId: string) {
    return this.paymentMethodsService.remove(tenantId, id);
  }
}