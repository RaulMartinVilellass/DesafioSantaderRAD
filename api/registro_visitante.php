<?php
require __DIR__ . '/db.php';
solo('POST');
$d = entrada();

$completo = texto($d['nombre'] ?? '', 250);
$email    = strtolower(texto($d['email'] ?? '', 150));
$clave    = (string)($d['password'] ?? '');
$estudios = texto($d['estudios'] ?? '', 150);
$sector   = texto($d['sector'] ?? '', 100);
$imagen   = imagen_perfil($d['imagen'] ?? null);

if ($completo === '') error('Escribe tu nombre.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) error('El correo electrónico no es válido.');
if (strlen($clave) < 8) error('La contraseña debe tener al menos 8 caracteres.');
if (strlen($clave) > 200) error('La contraseña es demasiado larga.');
if (correo_en_uso($email)) error('Ya existe una cuenta con ese correo.', 409);

// "Nombre y apellidos" llega en un solo campo: separamos por el primer espacio
$partes    = preg_split('/\s+/', $completo, 2);
$nombre    = mb_substr($partes[0], 0, 100);
$apellidos = mb_substr($partes[1] ?? '', 0, 150);

try {
    $st = db()->prepare(
        'INSERT INTO visitantes (nombre, apellidos, email, password, estudios, sector_interes, imagen, color_avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $st->execute([$nombre, $apellidos, $email, password_hash($clave, PASSWORD_DEFAULT), $estudios, $sector, $imagen ?: null, color_aleatorio($d['color'] ?? null)]);
    $id = (int)db()->lastInsertId();
} catch (PDOException $e) {
    if (es_duplicado($e)) error('Ya existe una cuenta con ese correo.', 409);
    error_log($e->getMessage());
    error('No se pudo completar el registro.', 500);
}

// Dejamos al usuario con la sesión iniciada
iniciar_sesion('visitante', $id, $nombre);

responder(['ok' => true, 'nombre' => $nombre, 'tipo' => 'visitante'], 201);
