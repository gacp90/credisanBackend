import { Module } from '@nestjs/common';
import { TenantClientsService } from './tenant-clients.service';
import { TenantClientsController } from './tenant-clients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantClient, TenantClientSchema } from './schemas/tenant-client.schema';
import { GlobalUser, GlobalUserSchema } from 'src/modules/global-users/schemas/global-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantClient.name, schema: TenantClientSchema },
      { name: GlobalUser.name, schema: GlobalUserSchema },
    ]),
  ],
  providers: [TenantClientsService],
  controllers: [TenantClientsController],
  exports: [TenantClientsService],
})
export class TenantClientsModule {}
