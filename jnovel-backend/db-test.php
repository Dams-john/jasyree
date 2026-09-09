<?php

$host = getenv('31.70.138.125');
$port = getenv('3306') ?: 3306;
$db   = getenv('my_app_db');
$user = getenv('render_user');
$pass = getenv('jasyre@123');

$mysqli = @new mysqli($host, $user, $pass, $db, $port);

if ($mysqli->connect_errno) {
    echo "DB CONNECTION FAILED<br>";
    echo "Error: " . htmlspecialchars($mysqli->connect_error);
} else {
    echo "DB CONNECTION SUCCESSFUL";
    $mysqli->close();
}
