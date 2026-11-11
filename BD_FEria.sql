-- =====================================================================
--  BASE DE DATOS: La Salle Business Match (feria_empleo)
--
--  CÓMO IMPORTARLA
--   * phpMyAdmin: crea/elige primero tu base de datos, pestaña "Importar",
--     selecciona este archivo.
--   * Terminal:   mysql -u USUARIO -p NOMBRE_BD < BD_FEria.sql
--   * Si tienes permisos para crear bases de datos, descomenta estas dos líneas:
-- CREATE DATABASE IF NOT EXISTS feria_empleo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE feria_empleo;
-- =====================================================================

SET NAMES utf8mb4;


-- 1. VISITANTES  (password guarda el HASH generado por PHP, nunca la clave en claro)
CREATE TABLE IF NOT EXISTS visitantes (
    id_visitante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    estudios VARCHAR(150),
    sector_interes VARCHAR(100),
    perfil TEXT,
    imagen MEDIUMTEXT NULL,            -- foto de perfil (data URL jpeg/png/webp)
    color_avatar VARCHAR(7) NULL       -- color de fondo de la inicial si no hay foto
) CHARACTER SET utf8mb4;


-- 2. EMPRESAS
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    persona_contacto VARCHAR(150),
    sector VARCHAR(100),
    descripcion TEXT,
    sitio_web VARCHAR(255),            -- enlace web donde enviar el CV
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NULL,        -- HASH generado por PHP
    telefono VARCHAR(20),
    imagen MEDIUMTEXT NULL,            -- logo / icono (data URL jpeg/png/webp)
    color_avatar VARCHAR(7) NULL
) CHARACTER SET utf8mb4;


-- 3. STANDS
CREATE TABLE IF NOT EXISTS stands (
    id_stand INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    numero VARCHAR(20) NOT NULL,
    ubicacion VARCHAR(100),
    descripcion TEXT,

    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa)
        ON DELETE CASCADE,

    UNIQUE (numero),
    UNIQUE (id_empresa)
) CHARACTER SET utf8mb4;


-- 4. VOTOS  (un visitante solo puede votar una vez)
CREATE TABLE IF NOT EXISTS votos (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_visitante INT NOT NULL UNIQUE,
    id_empresa INT NOT NULL,
    fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_visitante)
        REFERENCES visitantes(id_visitante)
        ON DELETE CASCADE,

    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa)
        ON DELETE CASCADE
) CHARACTER SET utf8mb4;


-- 5. RANKING
CREATE TABLE IF NOT EXISTS ranking (
    id_rank INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL UNIQUE,
    total_votos INT DEFAULT 0,

    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa)
        ON DELETE CASCADE
) CHARACTER SET utf8mb4;


-- 6. TRIGGER PARA SUMAR VOTOS
DROP TRIGGER IF EXISTS sumar_voto;
DELIMITER //

CREATE TRIGGER sumar_voto
AFTER INSERT ON votos
FOR EACH ROW
BEGIN
    INSERT INTO ranking (id_empresa, total_votos)
    VALUES (NEW.id_empresa, 1)
    ON DUPLICATE KEY UPDATE
        total_votos = total_votos + 1;
END //

DELIMITER ;


-- 7. TRIGGER PARA RESTAR VOTOS
DROP TRIGGER IF EXISTS restar_voto;
DELIMITER //

CREATE TRIGGER restar_voto
AFTER DELETE ON votos
FOR EACH ROW
BEGIN
    UPDATE ranking
    SET total_votos = GREATEST(total_votos - 1, 0)
    WHERE id_empresa = OLD.id_empresa;
END //

DELIMITER ;