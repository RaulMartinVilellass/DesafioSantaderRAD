<?php
require __DIR__ . '/db.php';
solo('POST');
$d = entrada();

$empresa     = texto($d['nombre_empresa'] ?? '', 150);
$contacto    = texto($d['contacto'] ?? '', 150);
$email       = strtolower(texto($d['email'] ?? '', 150));
$clave       = (string)($d['password'] ?? '');
$sector      = texto($d['sector'] ?? '', 100);
$descripcion = texto($d['descripcion'] ?? '', 2000);
$web         = url_opcional($d['sitio_web'] ?? '');
$imagen      = imagen_perfil($d['imagen'] ?? null);

if ($empresa === '') error('Escribe el nombre de la empresa.');
if ($contacto === '') error('Escribe la persona de contacto.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) error('El correo electrónico no es válido.');
if (strlen($clave) < 8) error('La contraseña debe tener al menos 8 caracteres.');
if (strlen($clave) > 200) error('La contraseña es demasiado larga.');
if (correo_en_uso($email)) error('Ya existe una cuenta con ese correo.', 409);

try {
    $st = db()->prepare(
        'INSERT INTO empresas (nombre_empresa, persona_contacto, email, password, sector, descripcion, sitio_web, imagen, color_avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $st->execute([$empresa, $contacto, $email, password_hash($clave, PASSWORD_DEFAULT),
                  $sector, $descripcion, $web ?: null, $imagen ?: null, color_aleatorio($d['color'] ?? null)]);
    $id = (int)db()->lastInsertId();
} catch (PDOException $e) {
    if (es_duplicado($e)) error('Ya existe una cuenta con ese correo.', 409);
    error_log($e->getMessage());
    error('No se pudo registrar la empresa.', 500);
}

// Dejamos a la empresa con la sesión iniciada
iniciar_sesion('empresa', $id, $empresa);

responder(['ok' => true, 'nombre' => $empresa, 'tipo' => 'empresa'], 201);
