<?php

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header("Content-Type: application/json");

    include("../config/luxe_database.php");

    /* =========================
    CHECK CONNECTION
    ========================= */
    if ($conn->connect_error) {
        die(json_encode([
            "success" => false,
            "message" => "Database connection failed"
        ]));
    }

    /* =========================
    TOTAL USERS
    ========================= */
    $totalUsers = $conn->query("
        SELECT COUNT(*) AS total_users 
        FROM luxe_users
    ")->fetch_assoc()['total_users'];

    /* =========================
    TOTAL PRODUCTS
    ========================= */
    $totalProducts = $conn->query("
        SELECT COUNT(*) AS total_products 
        FROM luxe_products
    ")->fetch_assoc()['total_products'];

    /* =========================
    TOTAL ORDERS
    ========================= */
    $totalOrders = $conn->query("
        SELECT COUNT(*) AS total_orders 
        FROM luxe_orders
    ")->fetch_assoc()['total_orders'];

    /* =========================
    TOTAL REVENUE
    ========================= */
    $totalRevenue = $conn->query("
        SELECT COALESCE(SUM(total_price),0) AS total_revenue 
        FROM luxe_orders
    ")->fetch_assoc()['total_revenue'];

    /* =========================
    LATEST ORDERS
    ========================= */
    $latestOrdersResult = $conn->query("
    SELECT
        o.id AS order_id,
        o.total_price,
        o.status,
        o.created_at,

        u.fullname,
        u.profile_img,

        p.name AS product_name

    FROM luxe_orders o
    LEFT JOIN luxe_users u ON o.user_id = u.id
    LEFT JOIN luxe_order_items oi ON o.id = oi.order_id
    LEFT JOIN luxe_products p ON oi.product_id = p.id

    ORDER BY o.id DESC
    LIMIT 5
    ");

    $latest_orders = [];

    while ($row = $latestOrdersResult->fetch_assoc()) {
        $latest_orders[] = $row;
    }

    /* =========================
    RECENT USERS
    ========================= */
    $recentUsersResult = $conn->query("
    SELECT
        fullname,
        email,
        profile_img,
        created_at
    FROM luxe_users
    ORDER BY id DESC
    LIMIT 3
    ");

    $recent_users = [];

    while ($row = $recentUsersResult->fetch_assoc()) {
        $recent_users[] = $row;
    }

    /* =========================
    LOW STOCK PRODUCTS (RECENT STOCK ALERT)
    ========================= */
    $lowStockResult = $conn->query("
    SELECT
        name,
        stock,
        price
    FROM luxe_products
    WHERE stock <= 6
    ORDER BY stock ASC
    LIMIT 5
    ");

    $recent_stock = [];

    while ($row = $lowStockResult->fetch_assoc()) {
        $recent_stock[] = $row;
    }

    /* =========================
    CART ITEMS (optional future use)
    ========================= */
    $totalCartItems = $conn->query("
        SELECT COUNT(*) AS total_cart_items 
        FROM luxe_cart
    ")->fetch_assoc()['total_cart_items'];

    /* =========================
    FINAL RESPONSE
    ========================= */
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