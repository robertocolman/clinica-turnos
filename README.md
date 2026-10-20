# Sistema de Gestion de Turnos Clinicos

Trabajo Final Integrador  
Tecnicatura Universitaria en Desarrollo Web  
Desarrollo de Aplicaciones Web (2026)  
Universidad Nacional de Entre Rios (UNER)  

## Descripcion del Sistema
Sistema web para la gestion integral de turnos medicos en una clinica. Permite la reserva, administracion y seguimiento de turnos para pacientes, medicos clinicos y personal administrativo, aplicando reglas de negocio sobre horarios de atencion (8:00 a 16:00 hs), duracion fija de turnos (1 hora), politicas de cancelacion y congelamiento de valores de consulta.

## Tecnologias Utilizadas
- Backend: NestJS, TypeORM, PostgreSQL
- Frontend: Angular
- Infraestructura y Servidor: Nginx, PM2
- Documentacion: Swagger, Compodoc

## Integrantes del Grupo y Division de Tareas
- Roberto Colman: Base de datos, configuracion y despliegue (P1)
- Nahuel Valenzuela: Login, roles y estructura del frontend (P2)
- Lucia: Reservas: reglas de negocio y API (P3)
- Esteban: Medicos: agenda y valor de consulta (P4)
- Martina Ascona: Reservas en el frontend (P5)

## Estructura del Proyecto
```text
clinica-turnos/
├── backend/    # API REST desarrollada con NestJS
└── frontend/   # Aplicacion Single Page Application (SPA) con Angular
```

## Requisitos Previos
- Node.js (version 20 o superior recomendada)
- PostgreSQL (version 15 o superior)
- npm (version 10 o superior)

## Puesta en Marcha en Desarrollo

### Backend
1. Navegar al directorio del backend:
   ```bash
   cd clinica-turnos/backend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno basandose en `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```
5. Acceder a la documentacion interactiva de Swagger:
   ```text
   http://localhost:3000/api/docs
   ```

### Frontend
1. Navegar al directorio del frontend:
   ```bash
   cd clinica-turnos/frontend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo con proxy:
   ```bash
   npm start
   ```
4. Acceder a la aplicacion en el navegador:
   ```text
   http://localhost:4200
   ```
