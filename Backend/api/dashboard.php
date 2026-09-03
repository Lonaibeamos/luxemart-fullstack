<?php

    header("Content-Type: application/json");
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    include("../config/luxe_database.php");

    /* ---------------- CHECK CONNECTION ---------------- */
    if ($conn->connect_error) {
        exit(json_encode([
            "success" => false,
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- COUNTS ---------------- */
    $totalUsers = $conn->query("SELECT COUNT(*) AS c FROM luxe_users")->fetch_assoc()["c"];
    $totalProducts = $conn->query("SELECT COUNT(*) AS c FROM luxe_products")->fetch_assoc()["c"];
    $totalOrders = $conn->query("SELECT COUNT(*) AS c FROM luxe_orders")->fetch_assoc()["c"];
    $totalCartItems = $conn->query("SELECT COUNT(*) AS c FROM luxe_cart")->fetch_assoc()["c"];

    /* ---------------- REVENUE ---------------- */
    $totalRevenue = $conn->query("SELECT COALESCE(SUM(total_price),0) AS r FROM luxe_orders")
        ->fetch_assoc()["r"];

    /* ---------------- LATEST ORDERS ---------------- */
    $latest_orders = [];

    $result = $conn->query("
        SELECT o.id, o.total_price, o.status, o.created_at,
            u.fullname, u.profile_img,
            p.name AS product_name
        FROM luxe_orders o
        LEFT JOIN luxe_users u ON o.user_id = u.id
        LEFT JOIN luxe_order_items oi ON o.id = oi.order_id
        LEFT JOIN luxe_products p ON oi.product_id = p.id
        ORDER BY o.id DESC
        LIMIT 5
    ");

    while ($row = $result->fetch_assoc()) {
        $latest_orders[] = $row;
    }

    /* ---------------- RECENT USERS ---------------- */
    $recent_users = [];

    $result = $conn->query("
        SELECT fullname, email, profile_img, created_at
        FROM luxe_users
        ORDER BY id DESC
        LIMIT 3
    ");

    while ($row = $result->fetch_assoc()) {
        $recent_users[] = $row;
    }

    /* ---------------- LOW STOCK ---------------- */
    $recent_stock = [];

    $result = $conn->query("
        SELECT name, stock, price
        FROM luxe_products
        WHERE stock <= 6
        ORDER BY stock ASC
        LIMIT 5
    ");

    while ($row = $result->fetch_assoc()) {
        $recent_stock[] = $row;
    }

    /* ---------------- RESPONSE ---------------- */
    echo json_encode([
        "success" => true,
        "total_users" => (int)$totalUsers,
        "total_products" => (int)$totalProducts,
        "total_orders" => (int)$totalOrders,
        "total_revenue" => (float)$totalRevenue,
        "total_cart_items" => (int)$totalCartItems,
        "latest_orders" => $latest_orders,
        "recent_users" => $recent_users,
        "recent_stock" => $recent_stock
    ]);

    $conn->close();
?>