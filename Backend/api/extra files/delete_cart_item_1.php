<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type");

    include "../config/luxe_database.php";

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["cart_id"])) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing cart_id"
        ]);
        exit;
    }

    $cart_id = (int)$data["cart_id"];

    $stmt = $conn->prepare("DELETE FROM luxe_cart WHERE id = ?");
    $stmt->bind_param("i", $cart_id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Item deleted"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Delete failed"
        ]);
    }

    $conn->close();
?>