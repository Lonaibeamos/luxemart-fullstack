<?php

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header("Content-Type: application/json");

    include "../config/luxe_database.php";

    /* ---------------- CHECK CONNECTION ---------------- */
    if ($conn->connect_error) {
        exit(json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- GET PRODUCTS ---------------- */
    $sql = "SELECT * FROM luxe_products";
    $result = $conn->query($sql);

    if (!$result) {
        exit(json_encode([
            "status" => "error",
            "message" => $conn->error
        ]));
    }

    /* ---------------- BUILD ARRAY ---------------- */
    $products = [];

    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    /* ---------------- RETURN ---------------- */
    echo json_encode($products);

    $conn->close();
?>