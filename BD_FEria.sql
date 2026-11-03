CREATE DATABASE feria_empleo;
USE feria_empleo;


-- 1. VISITANTES
CREATE TABLE visitantes (
    id_visitante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    estudios VARCHAR(150),
    perfil TEXT
);


-- 2. EMPRESAS
CREATE TABLE empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    descripcion TEXT,
    sitio_web VARCHAR(255),
    email VARCHAR(150),
    telefono VARCHAR(20)
);


-- 3. STANDS
CREATE TABLE stands (
    id_stand INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    numero VARCHAR(20) NOT NULL,
    ubicacion VARCHAR(100),
    descripcion TEXT,

    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa),

    UNIQUE (numero),
    UNIQUE (id_empresa)
);


-- 4. VOTOS
CREATE TABLE votos (
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
);


-- 5. RANKING
CREATE TABLE ranking (
    id_rank INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL UNIQUE,
    total_votos INT DEFAULT 0,

    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa)
        ON DELETE CASCADE
);


-- 6. TRIGGER PARA SUMAR VOTOS
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


-- 8. CONSULTA DEL RANKING
SELECT
    e.id_empresa,
    e.nombre_empresa,
    r.total_votos
FROM empresas e
LEFT JOIN ranking r
    ON e.id_empresa = r.id_empresa
ORDER BY COALESCE(r.total_votos, 0) DESC;