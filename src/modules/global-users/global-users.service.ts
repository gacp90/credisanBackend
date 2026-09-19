import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { GlobalUser } from './schemas/global-user.schema';
import { CreateGlobalUserDto } from './dto/create-global-user.dto';

@Injectable()
export class GlobalUsersService {
  constructor(
    @InjectModel(GlobalUser.name) private readonly userModel: Model<GlobalUser>,
  ) {}

  async create(createUserDto: CreateGlobalUserDto): Promise<GlobalUser> {
    try {
      // 1. Encriptar la contraseña (hash)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      // 2. Sobrescribir la contraseña en el DTO para guardar el hash
      const userToCreate = {
        ...createUserDto,
        password: hashedPassword,
      };

      // 3. Crear el usuario
      const createdUser = new this.userModel(userToCreate);
      const savedUser = await createdUser.save();

      // 4. Limpiar la respuesta (No devolver la contraseña)
      savedUser.password = undefined!;
      return savedUser;

    } catch (error: any) {
      // Manejar errores de MongoDB, específicamente violaciones de índices únicos (email o cédula duplicada)
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new ConflictException(`Ya existe un usuario registrado con ese ${field}`);
      }
      throw new InternalServerErrorException('Error al crear el usuario global');
    }
  }

  async findByEmail(email: string): Promise<GlobalUser | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // global-users.service.ts
  async updateProfile(userId: string, updateData: any) {
    try {
      // Usamos { new: true } para que devuelva el documento ya actualizado
      // y select('-password') para no devolver el hash por seguridad
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId, 
        { 
          fullName: updateData.fullName,
          cedula: updateData.cedula,
          email: updateData.email
        }, 
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return updatedUser;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('El correo o cédula ya están en uso por otro usuario.');
      }
      throw new InternalServerErrorException('Error al actualizar el perfil');
    }
  }

  async findByIdWithPassword(userId: string): Promise<GlobalUser | null> {
    // Usamos select('+password') para forzar a Mongoose a traer el hash
    return this.userModel.findById(userId).select('+password').exec();
  }

  async updatePassword(userId: string, newHashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: newHashedPassword }).exec();
  }

  
}