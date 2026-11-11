<?php
require __DIR__ . '/db.php';
solo('POST');
if (empresa_actual() !== null) error('Solo los visitantes pueden votar.', 403);
$idVisitante = exigir_login();
$d = entrada();

$idEmpresa = filter_var($d['id_empresa'] ?? null, FILTER_VALIDATE_INT);
if ($idEmpresa === false || $idEmpresa < 1) error('Empresa no válida.');

$st = db()->prepare('SELECT 1 FROM empresas WHERE id_empresa = ?');
$st->execute([$idEmpresa]);
if (!$st->fetchColumn()) error('Esa empresa no existe.', 404);

try {
    // El trigger "sumar_voto" de la base de datos actualiza la tabla ranking
    $st = db()->prepare('INSERT INTO votos (id_visitante, id_empresa) VALUES (?, ?)');
    $st->execute([$idVisitante, $idEmpresa]);
} catch (PDOException $e) {
    if (es_duplicado($e)) error('Ya has votado. Solo se permite un voto por visitante.', 409);
    error_log($e->getMessage());
    error('No se pudo guardar tu voto.', 500);
}

responder(['ok' => true, 'voto' => $idEmpresa], 201);
