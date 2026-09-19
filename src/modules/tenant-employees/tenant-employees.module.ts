import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantEmployee, TenantEmployeeSchema } from './schemas/tenant-employee.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TenantEmployee.name, schema: TenantEmployeeSchema }])
    ],
    exports: [
        // Exportamos el MongooseModule para que otros módulos (como tenant-management)
        // puedan usar el modelo de TenantEmployee
        MongooseModule 
    ]
})
export class TenantEmployeesModule {}
