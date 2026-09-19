import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClientPortalService } from './client-portal.service';
import { ClientPortalController } from './client-portal.controller';

import { TenantClient, TenantClientSchema } from '../client-sanes/tenant-clients/schemas/tenant-client.schema';
import { Assignment, AssignmentSchema } from '../client-sanes/assignments/schemas/assignment.schema';
import { Installment, InstallmentSchema } from '../client-sanes/installments/schemas/installment.schema';
import { Tenant, TenantSchema } from '../tenant-management/schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantClient.name, schema: TenantClientSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Installment.name, schema: InstallmentSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  providers: [ClientPortalService],
  controllers: [ClientPortalController]
})
export class ClientPortalModule {}
