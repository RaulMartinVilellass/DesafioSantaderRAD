<?php
// Guarda los cambios del perfil de la persona con sesión (visitante o empresa).
// Si "imagen" no viene en la petición se deja la que había; si viene vacía, se quita.
require __DIR__ . '/db.php';
solo('POST');
$d = entrada();

$idE = empresa_actual();
$idV = visitante_actual();
if ($idE === null && $idV === null) error('Inicia sesión para continuar.', 401);

$cambiaImagen = array_key_exists('imagen', $d);
$imagen = $cambiaImagen ? imagen_perfil($d['imagen']) : null;

try {
    if ($idE !== null) {
        $nombre = texto($d['nombre_empresa'] ?? '', 150);
        $contacto = texto($d['contacto'] ?? '', 150);
        $sector = texto($d['sector'] ?? '', 100);
        $descripcion = texto($d['descripcion'] ?? '', 2000);
        $web = url_opcional($d['sitio_web'] ?? '');
        if ($nombre === '') error('Escribe el nombre de la empresa.');
        if ($contacto === '') error('Escribe la persona de contacto.');

        $sql = 'UPDATE empresas SET nombre_empresa = ?, persona_contacto = ?, sector = ?, descripcion = ?, sitio_web = ?';
        $par = [$nombre, $contacto, $sector, $descripcion, $web ?: null];
        if ($cambiaImagen) { $sql .= ', imagen = ?'; $par[] = $imagen ?: null; }
        $sql .= ' WHERE id_empresa = ?';
        $par[] = $idE;
        db()->prepare($sql)->execute($par);
        $_SESSION['nombre'] = $nombre;
    } else {
        $completo = texto($d['nombre'] ?? '', 250);
        $estudios = texto($d['estudios'] ?? '', 150);
        $sector = texto($d['sector'] ?? '', 100);
        if ($completo === '') error('Escribe tu nombre.');
        $partes = preg_split('/\s+/', $completo, 2);
        $nombre = mb_substr($partes[0], 0, 100);
        $apellidos = mb_substr($partes[1] ?? '', 0, 150);

        $sql = 'UPDATE visitantes SET nombre = ?, apellidos = ?, estudios = ?, sector_interes = ?';
        $par = [$nombre, $apellidos, $estudios, $sector];
        if ($cambiaImagen) { $sql .= ', imagen = ?'; $par[] = $imagen ?: null; }
        $sql .= ' WHERE id_visitante = ?';
        $par[] = $idV;
        db()->prepare($sql)->execute($par);
        $_SESSION['nombre'] = $nombre;
    }
} catch (PDOException $e) {
    error_log($e->getMessage());
    error('No se pudo guardar el perfil.', 500);
}

responder(['ok' => true]);
