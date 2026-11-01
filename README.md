# Sistema de Gestión de Turnos Clínicos

Trabajo Final Integrador  
Tecnicatura Universitaria en Desarrollo Web  
Desarrollo de Aplicaciones Web (2026)  
Universidad Nacional de Entre Ríos (UNER)  

## Descripción del Sistema
Sistema web para la gestión integral de turnos médicos en una clínica. Permite la reserva, administración y seguimiento de turnos para pacientes, médicos clínicos y personal administrativo, aplicando reglas de negocio sobre horarios de atención (8:00 a 16:00 hs), duración fija de turnos (1 hora), políticas de cancelación y congelamiento de valores de consulta al momento de reservar.

## Tecnologías Utilizadas
- **Backend:** NestJS, TypeORM, PostgreSQL, Passport JWT, class-validator, class-transformer
- **Frontend:** Angular (SPA, Signals, Reactive Forms, Standalone Components)
- **Infraestructura y Servidor:** Nginx (Reverse Proxy & Servidor Web), PM2 (Process Manager)
- **Documentación:** Swagger (OpenAPI 3.0), Compodoc

## Integrantes del Grupo y División de Tareas
- **Roberto Colman (P1):** Base de datos, configuración y despliegue
- **Nahuel Valenzuela (P2):** Login, roles y estructura del frontend
- **Lucía Allassia (P3):** Reservas: reglas de negocio y API
- **Esteban Solís (P4):** Médicos: agenda y valor de consulta
- **Martina Ascona (P5):** Reservas en el frontend

---

## Modelo de Datos (PostgreSQL)

El sistema implementa el modelo de datos formal especificado en el Trabajo Final Integrador:

- **`usuarios`**: `id` (PK), `documento` (UNIQUE), `clave` (bcrypt), `nombres`, `apellidos`, `email` (UNIQUE), `rol` (`roles_usuarios`: 'ADMINISTRADOR', 'MEDICO', 'PACIENTE'), `estado` (`estados_usuarios`: 'ACTIVO', 'BAJA').
- **`medicos`**: `id` (PK), `id_usuario` (FK `usuarios.id`), `matricula` (INT UNIQUE), `especialidad`, `valor_consulta` (INT).
- **`reservas`**: `id` (PK), `id_medico` (FK `medicos.id`), `id_paciente` (FK `usuarios.id`), `fecha_hora` (TIMESTAMP), `estado` (`estados_reservas`: 'ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO'), `valor_consulta` (INT congelado).

---

## Usuarios de Prueba Disponibles (Credenciales)

Para facilitar la evaluación del sistema y la demostración en video, se encuentran cargados los siguientes usuarios en `init.sql`:

| Rol | Documento (DNI) | Contraseña | Descripción / Estado |
| :--- | :--- | :--- | :--- |
| **Administrador** | `11111111` | `admin123` | Control central, reserva para pacientes, gestión de aranceles |
| **Médico 1** | `22222222` | `medico123` | Dr. Carlos Pérez (Matrícula: 45892) - Agenda y atención |
| **Médico 2** | `55555555` | `medico123` | Dra. Mariana Gómez (Matrícula: 52140) |
| **Paciente 1** | `33333333` | `paciente123` | Lucía Martínez - Turnos propios y reservas |
| **Paciente 2** | `66666666` | `paciente123` | Juan Pablo Rodríguez |
| **Paciente (Baja)** | `44444444` | `baja123` | Rechazo 401 por usuario inactivo / dado de baja |

---

## Puesta en Marcha en Desarrollo

### 1. Base de Datos (PostgreSQL)
1. Crear la base de datos `clinica_turnos` en PostgreSQL.
2. Ejecutar el script SQL de inicialización:
   ```bash
   psql -U postgres -d clinica_turnos -f clinica-turnos/backend/sql/init.sql
   ```

### 2. Backend (NestJS)
1. Navegar al directorio del backend:
   ```bash
   cd clinica-turnos/backend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (`.env`):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   DB_NAME=clinica_turnos
   SWAGGER_HABILITADO=true
   JWT_SECRET=clave_secreta_jwt_clinica_2026
   JWT_EXPIRES_IN=8h
   ```
4. Iniciar en modo desarrollo:
   ```bash
   npm run start:dev
   ```
5. Documentación interactiva Swagger:
   ```text
   http://localhost:3000/api/docs
   ```

### 3. Frontend (Angular SPA)
1. Navegar al directorio del frontend:
   ```bash
   cd clinica-turnos/frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar con proxy de desarrollo configurado:
   ```bash
   npm start
   ```
4. Acceder en el navegador:
   ```text
   http://localhost:4200
   ```
5. Consultar documentación de arquitectura en Compodoc:
   ```bash
   npm run compodoc
   ```

---

## Despliegue en Producción (Demostración de Nginx y PM2)

### A. Ejecución del Backend con PM2 (Windows / Linux)
1. Compilar el backend de NestJS:
   ```bash
   cd clinica-turnos/backend
   npm run build
   ```
2. Iniciar el proceso mediante el archivo de ecosistema:
   ```bash
   pm2 start deploy/ecosystem.config.js
   pm2 status
   ```

### B. Servidor Web y Reverse Proxy con Nginx
1. Compilar el frontend Angular:
   ```bash
   cd clinica-turnos/frontend
   npm run build
   ```
2. Configurar `nginx.conf`:
   - Copiar el contenido de `deploy/nginx.conf` a la configuración de Nginx (`nginx/conf/nginx.conf` en Windows o `/etc/nginx/sites-available/` en Linux).
   - Apuntar la directiva `root` a la carpeta `dist/frontend/browser`.
3. Iniciar o recargar Nginx:
   ```bash
   nginx -s reload
   ```
4. Toda la aplicación estará disponible a través del puerto 80 con proxy transparente hacia `/api/` y ruteo SPA.
