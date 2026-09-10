<?php
<<<<<<< HEAD

$host = getenv('31.70.138.125');
$port = getenv('3306') ?: 3306;
$db   = getenv('my_app_db');
$user = getenv('render_user');
$pass = getenv('jasyre@123');
=======
$host = '31.70.138.125';
$port = 3306;
$db   = 'my_app_db';
$user = 'render_user';
$pass = 'jasyre@123';
>>>>>>> 0e3c9b80306f18876643f2b154efec4ef265ad37

$mysqli = @new mysqli($host, $user, $pass, $db, $port);

if ($mysqli->connect_errno) {
    echo "DB CONNECTION FAILED<br>";
    echo "Error: " . htmlspecialchars($mysqli->connect_error);
} else {
    echo "DB CONNECTION SUCCESSFUL";
    $mysqli->close();
<<<<<<< HEAD
}
=======
}
>>>>>>> 0e3c9b80306f18876643f2b154efec4ef265ad37
