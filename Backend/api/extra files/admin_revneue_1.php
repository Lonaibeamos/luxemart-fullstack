<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    include "../config/luxe_database.php";

    /* =========================
    GROSS REVENUE
    ========================= */
    $grossResult = $conn->query("
        SELECT COALESCE(SUM(total_price),0) AS gross_revenue
        FROM luxe_orders
    ");

    $grossRow = $grossResult->fetch_assoc();
    $grossRevenue = $grossRow["gross_revenue"];

    /* =========================
    TRANSACTIONS DATA
    ========================= */
    $sql = "
    SELECT 
        o.id AS transaction_id,
        u.fullname AS customer,
        o.payment_method,
        o.status,
        o.total_price AS gross_amount,
        (o.total_price - (o.total_price / 1.1)) AS tax,
        o.created_at
    FROM luxe_orders o
    LEFT JOIN luxe_users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    $transactions = [];

    while ($row = $result->fetch_assoc()) {

        $transactions[] = [
            "transaction_id" => $row["transaction_id"],
            "customer" => $row["customer"] ?? "Unknown User",
            "method" => $row["payment_method"],
            "status" => $row["status"],
            "tax" => round($row["tax"], 2),
            "gross_amount" => $row["gross_amount"]
        ];
    }

    /* =========================
    RESPONSE
    ========================= */
    echo json_encode([
        "status" => "success",
        "gross_revenue" => $grossRevenue,
        "transactions" => $transactions
    ]);

    $conn->close();
?>