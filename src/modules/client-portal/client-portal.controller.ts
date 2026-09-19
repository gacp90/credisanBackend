import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ClientPortalService } from './client-portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// ¡OJO! No importamos TenantRolesGuard

@Controller('my-dashboard')
@UseGuards(JwtAuthGuard) // Solo exigimos estar logueado
export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  @Get()
  async getDashboard(@Request() req: any) {
    // Extraemos el userId que validó Passport a partir del token JWT
    const userId = req.user.userId;
    
    return this.clientPortalService.getMyDashboard(userId);
  }
}