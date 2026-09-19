import { Module } from '@nestjs/common';
import { GlobalUsersController } from './global-users.controller';
import { GlobalUsersService } from './global-users.service';
import { GlobalUser, GlobalUserSchema } from './schemas/global-user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // ESTA ES LA LÍNEA CRÍTICA QUE FALTA O ESTÁ COMENTADA
    MongooseModule.forFeature([
      { name: GlobalUser.name, schema: GlobalUserSchema },
    ]),
  ],
  controllers: [GlobalUsersController],
  providers: [GlobalUsersService],
  exports: [GlobalUsersService]
})
export class GlobalUsersModule {}
