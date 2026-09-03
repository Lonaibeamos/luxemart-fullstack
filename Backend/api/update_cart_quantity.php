<?php

    error_reporting(E_ALL);
    ini_set("display_errors", 1);

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    include "../config/luxe_database.php";

    /* ---------------- GET DATA ---------------- */
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        exit(json_encode([
            "status" => "error",
            "message" => "Invalid input"
        ]));
    }

    $cart_id = $data["cart_id"] ?? "";
    $action = $data["action"] ?? "";

    if (!$cart_id || !$action) {
        exit(json_encode([
            "status" => "error",
            "message" => "Missing data"
        ]));
    }

    /* ---------------- GET CART ITEM ---------------- */
    $sql = "
    SELECT
        c.quantity,
        p.stock
    FROM luxe_cart c
    JOIN luxe_products p
    ON c.product_id = p.id
    WHERE c.id = $cart_id
    ";

    $result = $conn->query($sql);

    if ($result->num_rows == 0) {
        exit(json_encode([
            "status" => "error",
            "message" => "Cart item not found"
        ]));
    }

    $row = $result->fetch_assoc();

    $currentQty = $row["quantity"];
    $productStock = $row["stock"];

    /* ---------------- INCREASE ---------------- */
    if ($action == "increase") {

        if ($productStock <= 0) {
            exit(json_encode([
                "status" => "error",
                "message" => "Product is out of stock"
            ]));
        }

        if ($currentQty >= $productStock) {
            exit(json_encode([
                "status" => "error",
                "message" => "Maximum available stock reached"
            ]));
        }

        $newQty = $currentQty + 1;
    }

    /* ---------------- DECREASE ---------------- */ else if ($action == "decrease") {

        $newQty = $currentQty - 1;

        if ($newQty < 1) {
            $newQty = 1;
        }
    }

    /* ---------------- INVALID ACTION ---------------- */ else {

        exit(json_encode([
            "status" => "error",
            "message" => "Invalid action"
        ]));
    }

    /* ---------------- UPDATE CART ---------------- */
    $update = "
    UPDATE luxe_cart
    SET quantity = $newQty
    WHERE id = $cart_id
    ";

    if ($conn->query($update)) {

        echo json_encode([
            "status" => "success",
            "message" => "Quantity updated successfully",
            "new_quantity" => $newQty,
            "available_stock" => $productStock
        ]);
    } else {

        echo json_encode([
            "status" => "error",
            "message" => "Update failed"
        ]);
    }

    $conn->close();
?>