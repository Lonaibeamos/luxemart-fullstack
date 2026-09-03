<?php

    header("Content-Type: application/json");
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    require_once(__DIR__ . "/../config/luxe_database.php");

    if (!$conn) {
        echo json_encode([
            "status" => "error",
            "message" => "DB connection failed"
        ]);
        exit;
    }

    $order_id = $_POST['order_id'] ?? null;
    $user_id = $_POST['user_id'] ?? null;
    $amount = $_POST['amount'] ?? null;
    $payment_method = $_POST['payment_method'] ?? null;

    if (!$order_id || !$user_id || !$amount) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing data",
            "debug" => $_POST
        ]);
        exit;
    }

    $tax = $amount * 0.15;
    $total = $amount + $tax;

    $ref = "TXN-" . time();

    $query = "INSERT INTO luxe_transactions
    (order_id, user_id, amount, tax, total_amount, payment_method, status, transaction_ref)
    VALUES
    ('$order_id', '$user_id', '$amount', '$tax', '$total', '$payment_method', 'paid', '$ref')";

    if (!$conn->query($query)) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "message" => "Transaction saved"
    ]);
?>