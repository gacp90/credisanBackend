import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalUsersModule } from './modules/global-users/global-users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantManagementModule } from './modules/tenant-management/tenant-management.module';
import { TenantEmployeesModule } from './modules/tenant-employees/tenant-employees.module';
import { TenantClientsModule } from './modules/client-sanes/tenant-clients/tenant-clients.module';
import { CredisanesModule } from './modules/client-sanes/credisanes/credisanes.module';
import { TransactionsModule } from './modules/finances/transactions/transactions.module';
import { PaymentMethodsModule } from './modules/finances/payment-methods/payment-methods.module';
import { ClientPortalModule } from './modules/client-portal/client-portal.module';
import { InstallmentsModule } from './modules/client-sanes/installments/installments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    GlobalUsersModule,
    AuthModule,
    TenantManagementModule,
    TenantEmployeesModule,
    TenantClientsModule,
    CredisanesModule,
    TransactionsModule,
    PaymentMethodsModule,
    ClientPortalModule,
    InstallmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
