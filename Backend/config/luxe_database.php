<?php

$db_server = "sql302.infinityfree.com";
$db_user = "if0_42825351";
$db_pass = "LuxeMart2026";
$db_name = "if0_42825351_luxemart";

$conn = new mysqli($db_server, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "DB connection failed: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");
