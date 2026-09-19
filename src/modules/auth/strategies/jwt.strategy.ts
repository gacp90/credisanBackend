import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Extrae el token del header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SOLUCIÓN: Agregamos un valor por defecto por si no lee el .env
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tu_secreto_super_seguro_para_credisanes_2026',
    });
  }

  // Si el token es válido, este método se ejecuta automáticamente.
  // Lo que retornes aquí se inyectará en el objeto request (req.user)
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      cedula: payload.cedula,
      employments: payload.employments,
      clientOf: payload.clientOf,
    };
  }
}