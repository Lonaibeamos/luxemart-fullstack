<?php

header("Content-Type: application/json");

include "../config/luxe_database.php";

$user_id = $_POST["user_id"] ?? null;

if (!$user_id) {
    exit(json_encode([
        "status" => "error",
        "message" => "User ID missing"
    ]));
}

/* ---------------- GET CART ---------------- */
$cartQuery = $conn->query("
    SELECT * FROM luxe_cart 
    WHERE user_id = $user_id
");

if (!$cartQuery || $cartQuery->num_rows == 0) {
    exit(json_encode([
        "status" => "error",
        "message" => "Cart is empty"
    ]));
}

/* ---------------- CREATE ORDER ---------------- */
$conn->query("
    INSERT INTO luxe_orders 
    (user_id, total_price, payment_method, status, created_at)
    VALUES 
    ($user_id, 0, 'online', 'pending', NOW())
");

$order_id = $conn->insert_id;

$total_price = 0;

/* ---------------- LOOP CART ITEMS ---------------- */
while ($item = $cartQuery->fetch_assoc()) {

    $product_id = $item["product_id"];
    $qty = $item["quantity"];

    /* GET PRODUCT */
    $productResult = $conn->query("
        SELECT price, stock 
        FROM luxe_products 
        WHERE id = $product_id
    ");

    $product = $productResult->fetch_assoc();

    if (!$product) {
        exit(json_encode([
            "status" => "error",
            "message" => "Product not found"
        ]));
    }

    if ($product["stock"] < $qty) {
        exit(json_encode([
            "status" => "error",
            "message" => "Not enough stock"
        ]));
    }

    $price = $product["price"];
    $subtotal = $price * $qty;

    $total_price += $subtotal;

    /* UPDATE STOCK */
    $conn->query("
        UPDATE luxe_products 
        SET stock = stock - $qty 
        WHERE id = $product_id
    ");

    /* INSERT ORDER ITEMS */
    $conn->query("
        INSERT INTO `luxe_order_items`
        (order_id, product_id, quantity, price)
        VALUES 
        ($order_id, $product_id, $qty, $price)
    ");
}

/* ---------------- UPDATE ORDER TOTAL ---------------- */
$conn->query("
    UPDATE luxe_orders 
    SET total_price = $total_price, status = 'paid'
    WHERE id = $order_id
");

/* ---------------- CLEAR CART ---------------- */
$conn->query("
    DELETE FROM luxe_cart 
    WHERE user_id = $user_id
");

/* ---------------- RESPONSE ---------------- */
echo json_encode([
    "status" => "success",
    "message" => "Order completed successfully",
    "order_id" => $order_id,
    "total" => $total_price
]);

$conn->close();
