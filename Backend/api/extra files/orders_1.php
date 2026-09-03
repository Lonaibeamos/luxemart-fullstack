<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type");

    include "../config/luxe_database.php";

    /*
        |--------------------------------------------------------------------------
        | GET FORM DATA
        |--------------------------------------------------------------------------
        */

    $user_id = $_POST["user_id"] ?? null;
    $first_name = $_POST["first_name"] ?? "";
    $last_name = $_POST["last_name"] ?? "";
    $street_address = $_POST["street_address"] ?? "";
    $city = $_POST["city"] ?? "";
    $state = $_POST["state"] ?? "";
    $payment_method = $_POST["payment_method"] ?? "";

    /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

    if (!$user_id || !$payment_method) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing required data"
        ]);
        exit;
    }

    /*
        |--------------------------------------------------------------------------
        | GET CART ITEMS FROM DATABASE
        |--------------------------------------------------------------------------
        */

    $cart_sql = "
        SELECT c.product_id, c.quantity, p.price
        FROM luxe_cart c
        JOIN luxe_products p ON c.product_id = p.id
        WHERE c.user_id = ?
        ";

    $stmt = $conn->prepare($cart_sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $cart_items = [];
    $total_price = 0;

    while ($row = $result->fetch_assoc()) {
        $cart_items[] = $row;
        $total_price += $row["price"] * $row["quantity"];
    }

    /*
        |--------------------------------------------------------------------------
        | CHECK IF CART IS EMPTY
        |--------------------------------------------------------------------------
        */

    if (count($cart_items) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Cart is empty"
        ]);
        exit;
    }

    /*
        |--------------------------------------------------------------------------
        | INSERT INTO ORDERS TABLE
        |--------------------------------------------------------------------------
        */

    $order_sql = "
        INSERT INTO luxe_orders 
        (user_id, total_price, payment_method, status)
        VALUES (?, ?, ?, 'pending')
        ";

    $order_stmt = $conn->prepare($order_sql);
    $order_stmt->bind_param("ids", $user_id, $total_price, $payment_method);

    if (!$order_stmt->execute()) {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create order"
        ]);
        exit;
    }

    $order_id = $order_stmt->insert_id;

    /*
        |--------------------------------------------------------------------------
        | INSERT ORDER ITEMS
        |--------------------------------------------------------------------------
        */

    $item_sql = "
        INSERT INTO luxe_order_items
        (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        ";

    $item_stmt = $conn->prepare($item_sql);

    foreach ($cart_items as $item) {

        $item_stmt->bind_param(
            "iiid",
            $order_id,
            $item["product_id"],
            $item["quantity"],
            $item["price"]
        );

        $item_stmt->execute();
    }

    /*
        |--------------------------------------------------------------------------
        | ⭐ STOCK UPDATE (FIX ADDED HERE ONLY)
        |--------------------------------------------------------------------------
        */

    $stock_stmt = $conn->prepare("
            UPDATE luxe_products 
            SET stock = stock - ? 
            WHERE id = ?
        ");

    foreach ($cart_items as $item) {

        $qty = $item["quantity"];
        $product_id = $item["product_id"];

        $stock_stmt->bind_param("ii", $qty, $product_id);
        $stock_stmt->execute();
    }

    /*
        |--------------------------------------------------------------------------
        | OPTIONAL: CLEAR CART AFTER ORDER
        |--------------------------------------------------------------------------
        */

    $clear = $conn->prepare("DELETE FROM luxe_cart WHERE user_id = ?");
    $clear->bind_param("i", $user_id);
    $clear->execute();

    /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

    echo json_encode([
        "status" => "success",
        "message" => "Order placed successfully",
        "order_id" => $order_id,
        "total" => $total_price
    ]);

    $conn->close();
?>