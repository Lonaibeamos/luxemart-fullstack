<?php

    header('Content-Type: application/json');
    include "../config/luxe_database.php";

    $user_id = $_POST['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode([
            "status" => "error",
            "message" => "User ID missing"
        ]);
        exit;
    }

    /* ===============================
    GET CART ITEMS
    ================================ */
    $cartQuery = mysqli_query($conn, "
        SELECT * 
        FROM luxe_cart 
        WHERE user_id = '$user_id'
    ");

    if (!$cartQuery || mysqli_num_rows($cartQuery) == 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Cart is empty"
        ]);
        exit;
    }

    mysqli_begin_transaction($conn);

    try {

        $total_price = 0;

        /* ===============================
        1. CREATE ORDER
        =============================== */
        $orderInsert = mysqli_query($conn, "
            INSERT INTO luxe_orders (user_id, total_price, payment_method, status, created_at)
            VALUES ('$user_id', 0, 'online', 'pending', NOW())
        ");

        if (!$orderInsert) {
            throw new Exception("Order creation failed: " . mysqli_error($conn));
        }

        $order_id = mysqli_insert_id($conn);

        /* ===============================
        2. LOOP CART ITEMS
        =============================== */
        while ($item = mysqli_fetch_assoc($cartQuery)) {

            $product_id = $item['product_id'];
            $qty = $item['quantity'];

            // GET PRODUCT
            $productResult = mysqli_query($conn, "
                SELECT price, stock 
                FROM luxe_products 
                WHERE id = '$product_id'
                FOR UPDATE
            ");

            $product = mysqli_fetch_assoc($productResult);

            if (!$product) {
                throw new Exception("Product not found ID: $product_id");
            }

            if ($product['stock'] < $qty) {
                throw new Exception("Not enough stock for product ID: $product_id");
            }

            $price = $product['price'];
            $subtotal = $price * $qty;

            $total_price += $subtotal;

            /* ===============================
            UPDATE STOCK
            =============================== */
            mysqli_query($conn, "
                UPDATE luxe_products 
                SET stock = stock - $qty 
                WHERE id = '$product_id'
            ");

            /* ===============================
            INSERT ORDER ITEMS
            =============================== */
            mysqli_query($conn, "
                INSERT INTO `luxe order items` (order_id, product_id, quantity, price)
                VALUES ('$order_id', '$product_id', '$qty', '$price')
            ");
        }

        /* ===============================
        3. UPDATE ORDER TOTAL
        =============================== */
        mysqli_query($conn, "
            UPDATE luxe_orders 
            SET total_price = '$total_price', status = 'paid'
            WHERE id = '$order_id'
        ");

        /* ===============================
        4. CLEAR CART
        =============================== */
        mysqli_query($conn, "
            DELETE FROM luxe_cart 
            WHERE user_id = '$user_id'
        ");

        mysqli_commit($conn);

        echo json_encode([
            "status" => "success",
            "message" => "Order completed successfully",
            "order_id" => $order_id,
            "total" => $total_price
        ]);
    } catch (Exception $e) {

        mysqli_rollback($conn);

        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
?>