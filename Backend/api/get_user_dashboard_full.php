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

    /* ---------------- GET USER ORDERS ---------------- */
    $sql = "
    SELECT 
        o.id AS order_id,
        o.total_price,
        o.payment_method,
        o.status,
        o.created_at,
        oi.quantity,
        p.name,
        p.image,
        p.price AS product_price
    FROM luxe_orders o
    JOIN luxe_order_items oi ON o.id = oi.order_id
    JOIN luxe_products p ON oi.product_id = p.id
    WHERE o.user_id = $user_id
    ORDER BY o.created_at DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        exit(json_encode([
            "status" => "error",
            "message" => $conn->error
        ]));
    }

    /* ---------------- BUILD ARRAY ---------------- */
    $orders = [];

    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    /* ---------------- RESPONSE ---------------- */
    echo json_encode([
        "status" => "success",
        "total_orders" => count($orders),
        "orders" => $orders
    ]);

    $conn->close();
?>