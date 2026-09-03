<?php

$db_server = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "luxecommerce_db";

$conn = new mysqli($db_server, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "DB connection failed: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");
