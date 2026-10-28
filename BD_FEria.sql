
CREATE DATABASE feria_empleo;

USE feria_empleo;

-- 1. Usuarios: acceso para todos los tipos de cuenta
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('visitante', 'empresa', 'admin')
        NOT NULL DEFAULT 'visitante',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Información adicional de los visitantes
CREATE TABLE visitantes (
    id_visitante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    estudios VARCHAR(150),
    perfil TEXT,
    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- 3. Información de las empresas
CREATE TABLE empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nombre_empresa VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    descripcion TEXT,
    sitio_web VARCHAR(255),
    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- 4. Ferias de empleo
CREATE TABLE ferias (
    id_feria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    lugar VARCHAR(200),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

-- 5. Stands de las empresas en cada feria
CREATE TABLE stands (
    id_stand INT AUTO_INCREMENT PRIMARY KEY,
    id_feria INT NOT NULL,
    id_empresa INT NOT NULL,
    numero VARCHAR(20) NOT NULL,
    ubicacion VARCHAR(100),
    descripcion TEXT,
    FOREIGN KEY (id_feria)
        REFERENCES ferias(id_feria),
    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa),
    UNIQUE (id_feria, numero),
    UNIQUE (id_feria, id_empresa)
);

-- 6. Ofertas de empleo
CREATE TABLE ofertas (
    id_oferta INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    tipo_contrato VARCHAR(80),
    ubicacion VARCHAR(150),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activa', 'cerrada')
        NOT NULL DEFAULT 'activa',
    FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa)
        ON DELETE CASCADE
);

-- 7. Ofertas guardadas como favoritas
CREATE TABLE favoritos (
    id_visitante INT NOT NULL,
    id_oferta INT NOT NULL,
    fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_visitante, id_oferta),
    FOREIGN KEY (id_visitante)
        REFERENCES visitantes(id_visitante)
        ON DELETE CASCADE,
    FOREIGN KEY (id_oferta)
        REFERENCES ofertas(id_oferta)
        ON DELETE CASCADE
);

-- 8. Solicitudes de empleo
CREATE TABLE solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_visitante INT NOT NULL,
    id_oferta INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'revisada', 'aceptada', 'rechazada')
        NOT NULL DEFAULT 'pendiente',
    UNIQUE (id_visitante, id_oferta),
    FOREIGN KEY (id_visitante)
        REFERENCES visitantes(id_visitante)
        ON DELETE CASCADE,
    FOREIGN KEY (id_oferta)
        REFERENCES ofertas(id_oferta)
        ON DELETE CASCADE
);
