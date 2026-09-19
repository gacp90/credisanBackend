import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Este decorador recibe una lista de roles permitidos (Ej: 'OWNER', 'ADMIN')
// y los guarda en la metadata de la ruta para que el Guard los pueda leer.
export const RequireRole = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);