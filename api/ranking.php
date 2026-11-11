<?php
require __DIR__ . '/db.php';
solo('GET');

$filas = db()->query(
    'SELECT e.id_empresa, e.nombre_empresa, COALESCE(r.total_votos, 0) AS total_votos
       FROM empresas e
       LEFT JOIN ranking r ON e.id_empresa = r.id_empresa
      ORDER BY COALESCE(r.total_votos, 0) DESC, e.nombre_empresa ASC'
)->fetchAll();

foreach ($filas as &$f) {
    $f['total_votos'] = (int)$f['total_votos'];
}

responder(['ok' => true, 'ranking' => $filas]);
