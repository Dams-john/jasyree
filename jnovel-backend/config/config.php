<?php
header('Content-Type: application/json');

try {
    $host = '31.70.138.125';
    $db   = 'my_app_db';
    $user = 'render_user';
    $pass = 'jasyre@123';

    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

} catch (PDOException $e) {
     http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit();
}
