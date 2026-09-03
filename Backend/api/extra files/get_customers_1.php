<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    include('../config/luxe_database.php'); 

    if (!$conn) {
        echo json_encode([
            "status" => "error",
            "message" => "DB connection not found"
        ]);
        exit;
    }

    if ($conn->connect_error) {
        echo json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]);
        exit;
    }

    $sql = "SELECT id, fullname, email,password, phone, profile_img ,  status, created_at FROM luxe_users";
    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    $customers = [];

    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }

    echo json_encode($customers);

    $conn->close();
?>