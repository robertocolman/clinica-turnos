-- ==============================================================================
-- SISTEMA DE GESTION DE TURNOS CLINICOS
-- Trabajo Practico Integrador - UNER (DAW 2026)
-- Script de Creacion e Inicializacion de Base de Datos (PostgreSQL)
-- Modelo exacto segun DER oficial de consignas
-- ==============================================================================

SET client_encoding = 'UTF8';

DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS roles_usuarios CASCADE;
DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS estados_usuarios CASCADE;
DROP TYPE IF EXISTS estado_usuario CASCADE;
DROP TYPE IF EXISTS estados_reservas CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;

CREATE TYPE roles_usuarios AS ENUM ('ADMINISTRADOR', 'MEDICO', 'PACIENTE');
CREATE TYPE estados_usuarios AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE estados_reservas AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    documento TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rol roles_usuarios NOT NULL DEFAULT 'PACIENTE',
    estado estados_usuarios NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    matricula INT NOT NULL UNIQUE,
    especialidad TEXT NOT NULL DEFAULT 'Clinica Medica',
    valor_consulta INT NOT NULL DEFAULT 15000,
    CONSTRAINT fk_medico_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    id_medico INT NOT NULL,
    id_paciente INT NOT NULL,
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    estado estados_reservas NOT NULL DEFAULT 'ACTIVO',
    valor_consulta INT NOT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelado_en TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT fk_reserva_medico FOREIGN KEY (id_medico) 
        REFERENCES medicos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_paciente FOREIGN KEY (id_paciente) 
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- Indices para busquedas optimas y rendimiento
CREATE INDEX idx_reservas_medico_fecha ON reservas(id_medico, fecha_hora);
CREATE INDEX idx_reservas_paciente ON reservas(id_paciente);
CREATE INDEX idx_reservas_estado ON reservas(estado);

-- Regla de negocio critica: Un medico no puede tener 2 reservas en el mismo horario
-- (a excepcion de los turnos cancelados)
CREATE UNIQUE INDEX uq_reservas_medico_horario
ON reservas (id_medico, fecha_hora)
WHERE estado <> 'CANCELADO';

-- ==============================================================================
-- Datos de prueba para evaluacion y demostracion
-- Claves encriptadas con bcrypt ($2b$10$)
-- ==============================================================================
INSERT INTO usuarios (id, documento, clave, nombres, apellidos, email, rol, estado) VALUES
(1, '11111111', '$2b$10$uxs5QsPdFgtvRPIhnqyoYO5ou0r5pUFw9yvtmgQCfZCVhNY3skeJa', 'Admin', 'Sistema', 'admin@clinica.uner.edu.ar', 'ADMINISTRADOR', 'ACTIVO'),
(2, '22222222', '$2b$10$ilGyD0Ft79iaHBw.06WC3OY5/KC2o3vR0yBmtY0d3yZC9s.8l9Vw2', 'Carlos', 'Perez', 'dr.perez@clinica.uner.edu.ar', 'MEDICO', 'ACTIVO'),
(3, '33333333', '$2b$10$kdAoICOG8Ex7zpteUvZXB.k4yCOg5hRKIwfTjoUj/RfGTcP2O6X.m', 'Lucia', 'Martinez', 'paciente@gmail.com', 'PACIENTE', 'ACTIVO'),
(4, '44444444', '$2b$10$kTCgcXbw2lCrKxFUQXUuO.ZPMa5w5t6nALwyfdMAcbYJWswIj4bJ2', 'Esteban', 'Inactivo', 'baja@clinica.uner.edu.ar', 'PACIENTE', 'BAJA'),
(5, '55555555', '$2b$10$ilGyD0Ft79iaHBw.06WC3OY5/KC2o3vR0yBmtY0d3yZC9s.8l9Vw2', 'Mariana', 'Gomez', 'dra.gomez@clinica.uner.edu.ar', 'MEDICO', 'ACTIVO'),
(6, '66666666', '$2b$10$kdAoICOG8Ex7zpteUvZXB.k4yCOg5hRKIwfTjoUj/RfGTcP2O6X.m', 'Juan Pablo', 'Rodriguez', 'juan.rodriguez@gmail.com', 'PACIENTE', 'ACTIVO');

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

INSERT INTO medicos (id, id_usuario, matricula, especialidad, valor_consulta) VALUES
(1, 2, 45892, 'Clinica Medica General', 15000),
(2, 5, 52140, 'Clinica Medica General', 18000);

SELECT setval('medicos_id_seq', (SELECT MAX(id) FROM medicos));

INSERT INTO reservas (id, id_medico, id_paciente, fecha_hora, estado, valor_consulta) VALUES
(1, 1, 3, '2026-11-10 09:00:00', 'ACTIVO', 15000),
(2, 1, 3, '2026-11-12 11:00:00', 'CANCELADO', 15000),
(3, 2, 6, '2026-11-10 10:00:00', 'ACTIVO', 18000);

SELECT setval('reservas_id_seq', (SELECT MAX(id) FROM reservas));