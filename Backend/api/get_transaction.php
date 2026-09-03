<?php

    header("Content-Type: application/json");

    include "../config/luxe_database.php";

    /* ---------------- GET USER ID ---------------- */
    $user_id = $_GET["user_id"] ?? null;

    if (!$user_id) {
        exit(json_encode([
            "status" => "error",
            "message" => "User ID required"
        ]));
    }

    /* ---------------- GET LAST TRANSACTION ---------------- */
    $sql = "
    SELECT *
    FROM luxe_transactions
    WHERE user_id = $user_id
    ORDER BY id DESC
    LIMIT 1
    ";

    $result = $conn->query($sql);

    if (!$result) {
        exit(json_encode([
            "status" => "error",
            "message" => $conn->error
        ]));
    }

    $transaction = $result->fetch_assoc();

    /* ---------------- RESPONSE ---------------- */
    echo json_encode([
        "status" => "success",
        "data" => $transaction
    ]);

    $conn->close();
?>