<?php
require __DIR__ . '/db.php';
solo('POST');
$d = entrada();

$email = strtolower(texto($d['email'] ?? '', 150));
$clave = (string)($d['password'] ?? '');

if ($email === '' || $clave === '') error('Escribe tu correo y tu contraseña.');

// Se busca el correo entre visitantes y entre empresas
$st = db()->prepare('SELECT id_visitante AS id, nombre, password FROM visitantes WHERE email = ?');
$st->execute([$email]);
$u = $st->fetch();
$tipo = 'visitante';

if (!$u || !password_verify($clave, (string)$u['password'])) {
    $st = db()->prepare('SELECT id_empresa AS id, nombre_empresa AS nombre, password FROM empresas WHERE email = ?');
    $st->execute([$email]);
    $u = $st->fetch();
    $tipo = 'empresa';
}

// Mismo mensaje si falla el correo o la clave, para no revelar qué cuentas existen
if (!$u || !$u['password'] || !password_verify($clave, $u['password'])) {
    usleep(300000); // frena un poco los intentos automáticos
    error('Correo o contraseña incorrectos.', 401);
}

iniciar_sesion($tipo, (int)$u['id'], $u['nombre']);

responder(['ok' => true, 'nombre' => $u['nombre'], 'tipo' => $tipo]);
