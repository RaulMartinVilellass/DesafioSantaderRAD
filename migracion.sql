-- =====================================================================
--  MIGRACIÓN: solo si YA tenías la base de datos importada antes.
--  (Si importas BD_FEria.sql desde cero, NO hace falta ejecutar esto.)
--  Ejecútalo UNA sola vez en phpMyAdmin > SQL.
-- =====================================================================
ALTER TABLE visitantes
    ADD COLUMN imagen MEDIUMTEXT NULL,
    ADD COLUMN color_avatar VARCHAR(7) NULL;

ALTER TABLE empresas
    ADD COLUMN password VARCHAR(255) NULL,
    ADD COLUMN imagen MEDIUMTEXT NULL,
    ADD COLUMN color_avatar VARCHAR(7) NULL;

-- Opcional (evita dos empresas con el mismo correo). Si da error por correos
-- repetidos, corrige esas filas y vuelve a lanzarlo.
ALTER TABLE empresas ADD UNIQUE (email);
