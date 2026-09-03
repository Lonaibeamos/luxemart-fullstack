<?php

    include_once __DIR__ . "/../config/luxe_database.php";

    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data["user_id"];
    $product_id = $data["product_id"];
    $quantity = $data["quantity"];

    if ($quantity < 1) {
        $quantity = 1;
    }

    /* ---------------- GET PRODUCT ---------------- */
    $productQuery = "SELECT stock FROM luxe_products WHERE id = $product_id";
    $productResult = $conn->query($productQuery);

    if ($productResult->num_rows == 0) {
        exit(json_encode(["status" => "error", "message" => "Product not found"]));
    }

    $product = $productResult->fetch_assoc();
    $stock = $product["stock"];

    if ($stock <= 0) {
        exit(json_encode(["status" => "error", "message" => "Out of stock"]));
    }

    /* ---------------- CHECK CART ---------------- */
    $cartQuery = "SELECT id, quantity 
                FROM luxe_cart 
                WHERE user_id = $user_id AND product_id = $product_id";

    $cartResult = $conn->query($cartQuery);

    /* ---------------- UPDATE OR INSERT ---------------- */
    if ($cartResult->num_rows > 0) {

        $cart = $cartResult->fetch_assoc();
        $newQty = $cart["quantity"] + $quantity;

        if ($newQty > $stock) {
            exit(json_encode(["status" => "error", "message" => "Not enough stock"]));
        }

        $updateQuery = "UPDATE luxe_cart 
                        SET quantity = $newQty 
                        WHERE id = " . $cart["id"];

        $conn->query($updateQuery);

        echo json_encode(["status" => "success", "message" => "Cart updated"]);
    } else {

        if ($quantity > $stock) {
            exit(json_encode(["status" => "error", "message" => "Not enough stock"]));
        }

        $insertQuery = "INSERT INTO luxe_cart (user_id, product_id, quantity)
                        VALUES ($user_id, $product_id, $quantity)";

        $conn->query($insertQuery);

        echo json_encode(["status" => "success", "message" => "Product added"]);
    }

    $conn->close();
?>