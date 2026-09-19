import { Module } from '@nestjs/common';
import { TenantManagementController } from './tenant-management.controller';
import { TenantManagementService } from './tenant-management.service';
import { TenantEmployeesModule } from '../tenant-employees/tenant-employees.module';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    TenantEmployeesModule
  ],
  controllers: [TenantManagementController],
  providers: [TenantManagementService],
  exports: [TenantManagementService]
})
export class TenantManagementModule {}
