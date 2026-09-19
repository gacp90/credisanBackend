import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const GetTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Lo ideal es que el frontend envíe el tenantId en un header personalizado
    // Ej: "X-Tenant-ID: 64a7b..."
    const tenantId = request.headers['x-tenant-id'] || request.body?.tenantId || request.query?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('El tenantId es obligatorio para esta operación. (Header: x-tenant-id)');
    }

    return tenantId;
  },
);