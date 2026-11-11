<?php
// Funciones comunes de la API: conexión, sesión y respuestas JSON.

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// Sesión con cookie segura dentro de lo posible
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $https,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function responder(array $datos, int $codigo = 200): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function error(string $mensaje, int $codigo = 400): void {
    responder(['ok' => false, 'error' => $mensaje], $codigo);
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $c = require __DIR__ . '/config.php';
        $dsn = $c['dsn'] ?? "mysql:host={$c['host']};dbname={$c['dbname']};charset=utf8mb4";
        try {
            $pdo = new PDO($dsn, $c['user'] ?? null, $c['pass'] ?? null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            if (strpos($dsn, 'sqlite') === 0) {
                $pdo->exec('PRAGMA foreign_keys = ON');
            }
        } catch (PDOException $e) {
            error_log('Error de conexión: ' . $e->getMessage());
            error('No se pudo conectar con la base de datos.', 500);
        }
    }
    return $pdo;
}

// Solo se admite el método indicado
function solo(string $metodo): void {
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        error('Método no permitido.', 405);
    }
}

// Lee el cuerpo JSON de un POST. Exigir application/json evita que otra web
// pueda enviar formularios en nombre del usuario (CSRF).
function entrada(): array {
    $tipo = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($tipo, 'application/json') !== 0) {
        error('Formato no válido.', 415);
    }
    $datos = json_decode(file_get_contents('php://input'), true);
    if (!is_array($datos)) {
        error('Datos no válidos.', 400);
    }
    return $datos;
}

function texto($valor, int $max): string {
    $valor = trim((string)($valor ?? ''));
    return mb_substr($valor, 0, $max);
}

function visitante_actual(): ?int {
    return isset($_SESSION['id_visitante']) ? (int)$_SESSION['id_visitante'] : null;
}

function empresa_actual(): ?int {
    return isset($_SESSION['id_empresa']) ? (int)$_SESSION['id_empresa'] : null;
}

// Inicia sesión limpiando cualquier sesión anterior (visitante o empresa)
function iniciar_sesion(string $tipo, int $id, string $nombre): void {
    session_regenerate_id(true);
    $_SESSION = [];
    $_SESSION[$tipo === 'empresa' ? 'id_empresa' : 'id_visitante'] = $id;
    $_SESSION['tipo'] = $tipo;
    $_SESSION['nombre'] = $nombre;
}

// Color de fondo aleatorio para el avatar cuando la persona no sube imagen
function color_aleatorio($pedido = null): string {
    $paleta = ['#2a3a9c', '#c2185b', '#00796b', '#d84315', '#6a1b9a', '#1565c0',
               '#2e7d32', '#ad1457', '#4527a0', '#b71c1c', '#00695c', '#5d4037'];
    if (is_string($pedido) && in_array(strtolower($pedido), $paleta, true)) return strtolower($pedido);
    return $paleta[random_int(0, count($paleta) - 1)];
}

// Valida la imagen de perfil (data URL jpeg/png/webp, máx. ~300 KB).
// Devuelve la cadena limpia, '' si hay que quitarla, o corta con error.
function imagen_perfil($valor): string {
    if ($valor === null || $valor === '') return '';
    if (!is_string($valor) || strlen($valor) > 300000) error('La imagen es demasiado grande.');
    if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $valor, $m)) {
        error('Formato de imagen no válido (usa JPG, PNG o WEBP).');
    }
    $bin = base64_decode($m[2], true);
    if ($bin === false || @getimagesizefromstring($bin) === false) error('La imagen no es válida.');
    return $valor;
}

// URL http(s) opcional (enlace para enviar el CV)
function url_opcional($valor): string {
    $valor = texto($valor, 255);
    if ($valor === '') return '';
    if (!preg_match('#^https?://#i', $valor) || !filter_var($valor, FILTER_VALIDATE_URL)) {
        error('El enlace debe ser una URL válida que empiece por http:// o https://');
    }
    return $valor;
}

// ¿Existe ya ese correo como visitante o como empresa?
function correo_en_uso(string $email): bool {
    foreach (['visitantes', 'empresas'] as $t) {
        $st = db()->prepare("SELECT 1 FROM $t WHERE email = ?");
        $st->execute([$email]);
        if ($st->fetchColumn()) return true;
    }
    return false;
}

function exigir_login(): int {
    $id = visitante_actual();
    if ($id === null) {
        error('Inicia sesión para continuar.', 401);
    }
    return $id;
}

function es_duplicado(PDOException $e): bool {
    // 23000 = violación de restricción UNIQUE / clave
    return $e->getCode() === '23000';
}
