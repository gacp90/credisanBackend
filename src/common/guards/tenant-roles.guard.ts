import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/require-role.decorator';

@Injectable()
export class TenantRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos para la ruta desde el decorador @RequireRole
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador, la dejamos pasar (puede estar protegida solo por JwtAuthGuard)
    if (!requiredRoles) {
      return true;
    }

    // 2. Extraer el request y el usuario del JWT (inyectado por Passport)
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Esto viene del JwtStrategy que configuramos antes

    if (!user) {
      throw new UnauthorizedException('No se ha encontrado un token válido.');
    }

    // 3. Extraer el tenantId al que el usuario intenta acceder
    // (Buscamos en los headers, body o params de la ruta)
    const targetTenantId = request.headers['x-tenant-id'] || request.body?.tenantId || request.params?.tenantId;

    if (!targetTenantId) {
      throw new ForbiddenException('Debe especificar el tenantId (Ej: header X-Tenant-ID) para validar sus permisos.');
    }

    // 4. Buscar si el usuario tiene empleo en esa empresa específica
    const userEmploymentInTenant = user.employments?.find(
      (emp) => emp.tenantId === targetTenantId
    );

    if (!userEmploymentInTenant) {
      throw new ForbiddenException('Usted no pertenece al personal de esta empresa.');
    }

    // 5. Verificar si el rol que tiene en esa empresa está dentro de los roles requeridos
    const hasRole = requiredRoles.includes(userEmploymentInTenant.role);

    if (!hasRole) {
      throw new ForbiddenException(`Su rol de ${userEmploymentInTenant.role} no tiene permisos para esta acción.`);
    }

    return true; // Acceso concedido
  }
}