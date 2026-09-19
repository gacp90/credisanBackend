import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de CORS
  app.enableCors({
    origin: '*', // En producción, aquí pondrás los dominios permitidos (ej. tu frontend Angular)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Prefijo global para las rutas
  app.setGlobalPrefix('api/v1');

  // 3. Configuración de Validaciones (El equivalente a express-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina silenciosamente cualquier dato extra enviado en el body que no esté en el DTO
      forbidNonWhitelisted: true, // Lanza un error HTTP 400 si envían propiedades no válidas
      transform: true, // Transforma automáticamente los payloads (ej: strings a números si el DTO lo requiere)
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Credisanes Backend corriendo en: ${await app.getUrl()}`);
}
bootstrap();
