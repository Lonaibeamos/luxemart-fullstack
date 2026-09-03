<?php

    header("Content-Type: application/json");

    error_reporting(E_ALL);
    ini_set("display_errors", 1);

    include "../config/luxe_database.php";

    /* ---------------- CHECK CONNECTION ---------------- */
    if ($conn->connect_error) {
        exit(json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- GET DATA ---------------- */
    $order_id = $_POST["order_id"] ?? "";
    $user_id = $_POST["user_id"] ?? "";
    $amount = $_POST["amount"] ?? "";
    $payment_method = $_POST["payment_method"] ?? "";

    /* ---------------- VALIDATION ---------------- */
    if (!$order_id || !$user_id || !$amount || !$payment_method) {
        exit(json_encode([
            "status" => "error",
            "message" => "Missing required data"
        ]));
    }

    /* ---------------- CALCULATE TOTAL ---------------- */
    $tax = $amount * 0.15;
    $total = $amount + $tax;

    $ref = "TXN-" . time();

    /* ---------------- SAVE TRANSACTION ---------------- */
    $sql = "
    INSERT INTO luxe_transactions
    (order_id, user_id, amount, tax, total_amount, payment_method, status, transaction_ref)
    VALUES
    ('$order_id', '$user_id', '$amount', '$tax', '$total', '$payment_method', 'paid', '$ref')
    ";

    if ($conn->query($sql)) {

        echo json_encode([
            "status" => "success",
            "message" => "Transaction saved"
        ]);
    } else {

        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
    }

    $conn->close();
?>