-- ==============================================================================
-- SISTEMA DE GESTION DE TURNOS CLINICOS
-- Trabajo Practico Integrador - UNER (DAW 2026)
-- Script de Creacion e Inicializacion de Base de Datos (PostgreSQL)
-- Responsable: P1 - Roberto Colman
-- ==============================================================================

DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS estado_usuario CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;

CREATE TYPE rol_usuario AS ENUM ('ADMINISTRADOR', 'MEDICO', 'PACIENTE');
CREATE TYPE estado_usuario AS ENUM ('ACTIVO', 'INACTIVO', 'BAJA');
CREATE TYPE estado_reserva AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    documento VARCHAR(20) NOT NULL UNIQUE,
    clave VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    rol rol_usuario NOT NULL DEFAULT 'PACIENTE',
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    especialidad VARCHAR(100) NOT NULL,
    valor_consulta NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    CONSTRAINT fk_medico_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    estado estado_reserva NOT NULL DEFAULT 'ACTIVO',
    valor_consulta NUMERIC(10, 2) NOT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelado_en TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT fk_turno_paciente FOREIGN KEY (paciente_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_turno_medico FOREIGN KEY (medico_id) 
        REFERENCES medicos(id) ON DELETE RESTRICT
);

CREATE INDEX idx_turnos_medico_fecha ON turnos(medico_id, fecha_hora);
CREATE INDEX idx_turnos_paciente ON turnos(paciente_id);
CREATE INDEX idx_turnos_estado ON turnos(estado);

CREATE UNIQUE INDEX uq_turnos_medico_horario
ON turnos (medico_id, fecha_hora)
WHERE estado <> 'CANCELADO';

-- Datos de prueba (bcrypt)
INSERT INTO usuarios (id, documento, clave, nombres, apellidos, email, rol, estado) VALUES
(1, '11111111', '$2b$10$uxs5QsPdFgtvRPIhnqyoYO5ou0r5pUFw9yvtmgQCfZCVhNY3skeJa', 'Admin', 'Sistema', 'admin@clinica.uner.edu.ar', 'ADMINISTRADOR', 'ACTIVO'),
(2, '22222222', '$2b$10$ilGyD0Ft79iaHBw.06WC3OY5/KC2o3vR0yBmtY0d3yZC9s.8l9Vw2', 'Carlos', 'Pérez', 'dr.perez@clinica.uner.edu.ar', 'MEDICO', 'ACTIVO'),
(3, '33333333', '$2b$10$kdAoICOG8Ex7zpteUvZXB.k4yCOg5hRKIwfTjoUj/RfGTcP2O6X.m', 'Lucía', 'Martínez', 'paciente@gmail.com', 'PACIENTE', 'ACTIVO'),
(4, '44444444', '$2b$10$kTCgcXbw2lCrKxFUQXUuO.ZPMa5w5t6nALwyfdMAcbYJWswIj4bJ2', 'Esteban', 'Inactivo', 'baja@clinica.uner.edu.ar', 'PACIENTE', 'BAJA');

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

INSERT INTO medicos (id, usuario_id, especialidad, valor_consulta) VALUES
(1, 2, 'Medicina Clínica General', 15000.00);

SELECT setval('medicos_id_seq', (SELECT MAX(id) FROM medicos));

INSERT INTO turnos (id, paciente_id, medico_id, fecha_hora, estado, valor_consulta) VALUES
(1, 3, 1, '2026-10-25 09:00:00', 'ACTIVO', 15000.00),
(2, 3, 1, '2026-10-28 11:00:00', 'CANCELADO', 15000.00);

SELECT setval('turnos_id_seq', (SELECT MAX(id) FROM turnos));
