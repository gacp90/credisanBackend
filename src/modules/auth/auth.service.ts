import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { GlobalUsersService } from '../global-users/global-users.service';
import { LoginDto } from './dto/login.dto';
import { TenantManagementService } from '../tenant-management/tenant-management.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly globalUsersService: GlobalUsersService,
    private readonly jwtService: JwtService,
    private readonly tenantManagementService: TenantManagementService,
    // Inyectaremos TenantManagementService y ClientSanesService en el futuro
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Buscar al usuario
    const user = await this.globalUsersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    // 3. Consultar Dominios REALES
    const employments = await this.tenantManagementService.getRolesForUser(user._id.toString());
    
    // (Aún mantendremos mockeado a los clientes hasta que construyamos ese método)
    const clientOf = []; 

    // 4. Construir Payload (Aquí NO metemos el internalApiKey por seguridad, 
    // el JWT solo debe tener lo necesario para enrutamiento interno)
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      cedula: user.cedula,
      // Solo metemos tenantId y role para las validaciones del Guard
      employments: employments.map(emp => ({ tenantId: emp.tenantId, role: emp.role })), 
      clientOf,
    };

    // 5. Retornar al Frontend (Angular)
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        cedula: user.cedula,
        employments: employments, 
        clientOf,
      },
    };
  }

  async changePassword(userId: string, passwords: { currentPassword: string; newPassword: string }) {
    // 1. Buscamos al usuario usando el nuevo método del servicio global
    const user = await this.globalUsersService.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 2. Comparamos la contraseña actual que ingresó con la encriptada
    const isPasswordValid = await bcrypt.compare(passwords.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // 3. Encriptamos la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(passwords.newPassword, salt);
    
    // 4. Guardamos el cambio
    await this.globalUsersService.updatePassword(userId, newHashedPassword);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}