import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilitar CORS para permitir solicitudes desde el frontend Angular
  app.enableCors();

  // Prefijo global /api para todas las rutas
  app.setGlobalPrefix('api');

  // Validacion automatica de DTOs con transformacion (Criterio 2 de la Rubrica)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuracion de Swagger (Criterio 4 de la Rubrica)
  const swaggerHabilitado = configService.get<string>('SWAGGER_HABILITADO', 'true') === 'true';
  if (swaggerHabilitado) {
    const config = new DocumentBuilder()
      .setTitle('Clinica Turnos - API REST')
      .setDescription(
        'Documentacion interactiva de endpoints para el Sistema de Gestion de Turnos Clinicos (UNER DAW 2026). Permite probar autenticacion, roles, reservas y administracion.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Ingrese el token JWT obtenido al iniciar sesion en /api/auth/login',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Servidor Backend ejecutandose en: http://localhost:${port}/api`);
  logger.log(`Documentacion Swagger disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();
