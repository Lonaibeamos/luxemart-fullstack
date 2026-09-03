<?php

    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $name = $_POST["name"] ?? "";
    $description = $_POST["description"] ?? "";
    $price = $_POST["price"] ?? "";
    $category = $_POST["category"] ?? "";
    $brand = $_POST["brand"] ?? "";
    $stock = $_POST["stock"] ?? "";
    $rating = $_POST["rating"] ?? 0;
    $imageName = $_POST["image"] ?? "";

    /* ---------------- VALIDATION ---------------- */
    if (!$name || !$price || !$category) {
        exit(json_encode([
            "status" => "error",
            "message" => "Required fields missing"
        ]));
    }

    /* ---------------- INSERT ---------------- */
    $sql = "INSERT INTO luxe_products
    (name, description, price, category, brand, stock, rating, image, created_at)
    VALUES
    ('$name', '$description', '$price', '$category', '$brand', '$stock', '$rating', '$imageName', NOW())";

    if ($conn->query($sql)) {
        echo json_encode([
            "status" => "success",
            "message" => "Product added successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
    }

    $conn->close();
?>