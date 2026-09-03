<?php

    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    // get user id
    $user_id = $_GET["user_id"] ?? null;

    if (!$user_id) {
        echo json_encode([
            "status" => "error",
            "message" => "User ID required"
        ]);
        exit;
    }

    // get latest transaction for this user
    $stmt = $conn->prepare("
        SELECT *
        FROM luxe_transactions
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    ");

    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $transaction = $result->fetch_assoc();

    echo json_encode([
        "status" => "success",
        "data" => $transaction
    ]);
?>