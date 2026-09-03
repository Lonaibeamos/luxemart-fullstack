<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    include "../config/luxe_database.php";

    /* ---------------- GET USER ID ---------------- */
    $user_id = $_GET["user_id"] ?? null;

    if (!$user_id) {
        exit(json_encode([]));
    }

    /* ---------------- MAIN QUERY ---------------- */
    $sql = "
    SELECT 
        c.id AS cart_id,
        c.user_id,
        c.product_id,
        c.quantity,

        p.name,
        p.description,
        p.price,
        p.category,
        p.brand,
        p.stock,
        p.image,
        p.rating,
        p.is_featured

    FROM luxe_cart c
    INNER JOIN luxe_products p 
        ON c.product_id = p.id
    WHERE c.user_id = $user_id
    ";

    $result = $conn->query($sql);

    if (!$result) {
        exit(json_encode([
            "status" => "error",
            "message" => $conn->error
        ]));
    }

    /* ---------------- BUILD CART ARRAY ---------------- */
    $cart = [];

    while ($row = $result->fetch_assoc()) {
        $cart[] = $row;
    }

    /* ---------------- RETURN ---------------- */
    echo json_encode($cart);

    $conn->close();
?>