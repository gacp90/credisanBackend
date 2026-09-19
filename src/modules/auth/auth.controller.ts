import { Controller, Post, Body, HttpCode, HttpStatus, Put, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambia el 201 Created por defecto a 200 OK
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard) // Protegido con JWT
  async changePassword(@Req() req: any, @Body() body: any) {
    // El payload del JWT que creaste en el login guarda el ID en 'sub'
    const userId = req.user.userId; 
    
    return this.authService.changePassword(userId, body);
  }
}