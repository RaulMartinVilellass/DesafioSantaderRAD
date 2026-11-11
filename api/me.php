<?php
require __DIR__ . '/db.php';
solo('GET');

$idV = visitante_actual();
$idE = empresa_actual();

if ($idE !== null) {
    $st = db()->prepare('SELECT nombre_empresa, persona_contacto, sitio_web, sector, descripcion, imagen, color_avatar
                           FROM empresas WHERE id_empresa = ?');
    $st->execute([$idE]);
    $e = $st->fetch();
    if (!$e) { $_SESSION = []; responder(['ok' => true, 'logueado' => false]); }
    responder([
        'ok'       => true,
        'logueado' => true,
        'tipo'     => 'empresa',
        'nombre'   => $e['nombre_empresa'],
        'imagen'   => $e['imagen'] ?: null,
        'color'    => $e['color_avatar'] ?: null,
        'voto'     => null,
        'perfil'   => [
            'nombre_empresa' => $e['nombre_empresa'],
            'contacto'       => (string)$e['persona_contacto'],
            'sitio_web'      => (string)$e['sitio_web'],
            'sector'         => (string)$e['sector'],
            'descripcion'    => (string)$e['descripcion'],
        ],
    ]);
}

if ($idV === null) {
    responder(['ok' => true, 'logueado' => false]);
}

$st = db()->prepare('SELECT nombre, apellidos, estudios, sector_interes, imagen, color_avatar FROM visitantes WHERE id_visitante = ?');
$st->execute([$idV]);
$v = $st->fetch();
if (!$v) { $_SESSION = []; responder(['ok' => true, 'logueado' => false]); }

$st = db()->prepare('SELECT id_empresa FROM votos WHERE id_visitante = ?');
$st->execute([$idV]);
$voto = $st->fetchColumn();

responder([
    'ok'       => true,
    'logueado' => true,
    'tipo'     => 'visitante',
    'nombre'   => $v['nombre'],
    'imagen'   => $v['imagen'] ?: null,
    'color'    => $v['color_avatar'] ?: null,
    'voto'     => $voto === false ? null : (int)$voto,
    'perfil'   => [
        'nombre'   => trim($v['nombre'] . ' ' . (string)$v['apellidos']),
        'estudios' => (string)$v['estudios'],
        'sector'   => (string)$v['sector_interes'],
    ],
]);
