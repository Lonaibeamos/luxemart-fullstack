<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    include "../config/luxe_database.php";

    /* ---------------- GET INPUT ---------------- */
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["cart_id"])) {
        exit(json_encode([
            "status" => "error",
            "message" => "Missing cart_id"
        ]));
    }

    $cart_id = (int)$data["cart_id"];

    /* ---------------- DELETE ITEM ---------------- */
    $sql = "DELETE FROM luxe_cart WHERE id = $cart_id";

    if ($conn->query($sql)) {
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