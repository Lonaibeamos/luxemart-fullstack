<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    include('../config/luxe_database.php');

    /* ---------------- CHECK CONNECTION ---------------- */
    if ($conn->connect_error) {
        exit(json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- GET USERS ---------------- */
    $sql = "SELECT id, fullname, email, phone, profile_img, status, created_at 
            FROM luxe_users";

    $result = $conn->query($sql);

    if (!$result) {
        exit(json_encode([
            "status" => "error",
            "message" => $conn->error
        ]));
    }

    /* ---------------- BUILD ARRAY ---------------- */
    $customers = [];

    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }

    /* ---------------- RETURN ---------------- */
    echo json_encode($customers);

    $conn->close();
?>