<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    include("../config/luxe_database.php");

    /* ---------------- CHECK CONNECTION ---------------- */
    if ($conn->connect_error) {
        exit(json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- GET ORDERS ---------------- */
    $sql = "
    SELECT 
        o.id AS order_id,
        o.status,
        o.created_at,
        o.total_price,

        u.fullname,
        u.email,
        u.profile_img,

        p.name AS product_name,
        p.image AS product_image,

        oi.quantity,
        oi.price

    FROM luxe_orders o
    JOIN luxe_users u ON o.user_id = u.id
    JOIN luxe_order_items oi ON o.id = oi.order_id
    JOIN luxe_products p ON oi.product_id = p.id
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

    /* ---------------- RETURN ---------------- */
    echo json_encode($orders);

    $conn->close();
?>