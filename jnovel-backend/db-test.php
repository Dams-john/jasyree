<?php
$host = '31.70.138.125';
$port = 3306;
$db   = 'my_app_db';
$user = 'render_user';
$pass = 'jasyre@123';

$mysqli = @new mysqli($host, $user, $pass, $db, $port);

if ($mysqli->connect_errno) {
    echo "DB CONNECTION FAILED<br>";
    echo "Error: " . htmlspecialchars($mysqli->connect_error);
} else {
    echo "DB CONNECTION SUCCESSFUL";
    $mysqli->close();
}
