<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    include "../config/luxe_database.php";

    /* ---------------- GET DATA ---------------- */
    $user_id = $_POST["user_id"] ?? null;
    $payment_method = $_POST["payment_method"] ?? "";

    if (!$user_id || !$payment_method) {
        exit(json_encode([
            "status" => "error",
            "message" => "Missing required data"
        ]));
    }

    /* ---------------- GET CART ITEMS ---------------- */
    $cart_sql = "
    SELECT c.product_id, c.quantity, p.price
    FROM luxe_cart c
    JOIN luxe_products p ON c.product_id = p.id
    WHERE c.user_id = $user_id
    ";

    $result = $conn->query($cart_sql);

    if (!$result) {
        exit(json_encode([
            "status" => "error",
            "message" => $conn->error
        ]));
    }

    $cart_items = [];
    $total_price = 0;

    while ($row = $result->fetch_assoc()) {
        $cart_items[] = $row;
        $total_price += $row["price"] * $row["quantity"];
    }

    /* ---------------- CHECK EMPTY CART ---------------- */
    if (count($cart_items) === 0) {
        exit(json_encode([
            "status" => "error",
            "message" => "Cart is empty"
        ]));
    }

    /* ---------------- INSERT ORDER ---------------- */
    $order_sql = "
    INSERT INTO luxe_orders 
    (user_id, total_price, payment_method, status)
    VALUES 
    ($user_id, $total_price, '$payment_method', 'pending')
    ";

    if (!$conn->query($order_sql)) {
        exit(json_encode([
            "status" => "error",
            "message" => "Failed to create order"
        ]));
    }

    $order_id = $conn->insert_id;

    /* ---------------- INSERT ORDER ITEMS ---------------- */
    foreach ($cart_items as $item) {

        $product_id = $item["product_id"];
        $quantity = $item["quantity"];
        $price = $item["price"];

        $item_sql = "
        INSERT INTO luxe_order_items 
        (order_id, product_id, quantity, price)
        VALUES 
        ($order_id, $product_id, $quantity, $price)
        ";

        $conn->query($item_sql);
    }

    /* ---------------- UPDATE STOCK ---------------- */
    foreach ($cart_items as $item) {

        $product_id = $item["product_id"];
        $quantity = $item["quantity"];

        $stock_sql = "
        UPDATE luxe_products 
        SET stock = stock - $quantity 
        WHERE id = $product_id
        ";

        $conn->query($stock_sql);
    }

    /* ---------------- CLEAR CART ---------------- */
    $clear_sql = "DELETE FROM luxe_cart WHERE user_id = $user_id";
    $conn->query($clear_sql);

    /* ---------------- RESPONSE ---------------- */
    echo json_encode([
        "status" => "success",
        "message" => "Order placed successfully",
        "order_id" => $order_id,
        "total" => $total_price
    ]);

    $conn->close();
?>