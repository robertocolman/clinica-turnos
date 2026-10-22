import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { MedicosModule } from './medicos/medicos.module.js';
import { Usuario } from './database/entities/usuario.entity.js';
import { Medico } from './database/entities/medico.entity.js';
import { Turno } from './database/entities/turno.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD') || 'postgres',
        database: config.get<string>('DB_NAME', 'clinica_turnos'),
        entities: [Usuario, Medico, Turno],
        synchronize: false,
        logging: config.get<boolean>('DB_LOGGING', false),
      }),
    }),
    AuthModule,
    MedicosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}