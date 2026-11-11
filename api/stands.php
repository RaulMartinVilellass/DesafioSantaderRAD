<?php
require __DIR__ . '/db.php';
solo('GET');

$filas = db()->query(
    'SELECT e.id_empresa, e.nombre_empresa, e.sector, e.descripcion, e.sitio_web, e.imagen, e.color_avatar, s.numero, s.ubicacion
       FROM empresas e
       LEFT JOIN stands s ON s.id_empresa = e.id_empresa
      ORDER BY e.nombre_empresa'
)->fetchAll();

responder(['ok' => true, 'stands' => $filas]);
