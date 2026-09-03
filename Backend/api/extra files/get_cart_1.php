<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    include "../config/luxe_database.php";

    // ============================
    // GET USER ID
    // ============================
    $user_id = $_GET["user_id"] ?? null;

    if (!$user_id) {
        echo json_encode([]);
        exit;
    }

    // ============================
    // MAIN QUERY (JOIN CART + PRODUCTS)
    // ============================
    $sql = "
    SELECT 
        c.id AS cart_id,
        c.user_id,
        c.product_id,
        c.quantity,

        p.id AS product_id,
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
    WHERE c.user_id = ?
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => "SQL prepare failed"
        ]);
        exit;
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $cart = [];

    while ($row = $result->fetch_assoc()) {
        $cart[] = $row;
    }

    // ============================
    // RETURN DATA
    // ============================
    echo json_encode($cart);

    $conn->close();
?>