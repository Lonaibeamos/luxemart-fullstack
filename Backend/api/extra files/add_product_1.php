<?php
    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $name = $_POST["name"] ?? "";
    $description = $_POST["description"] ?? "";
    $price = $_POST["price"] ?? "";
    $category = $_POST["category"] ?? "";
    $brand = $_POST["brand"] ?? "";
    $stock = $_POST["stock"] ?? "";
    $rating = floatval($_POST["rating"] ?? 0);
    $imageName = $_POST["image"] ?? "";

    // VALIDATION
    if (!$name || !$price || !$category) {
        echo json_encode([
            "status" => "error",
            "message" => "Required fields missing"
        ]);
        exit;
    }

    // INSERT
    $stmt = $conn->prepare("
        INSERT INTO luxe_products
        (name, description, price, category, brand, stock, rating, image, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    $stmt->bind_param(
        "ssdssiss",
        $name,
        $description,
        $price,
        $category,
        $brand,
        $stock,
        $rating,
        $imageName
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Product added successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => $stmt->error
        ]);
    }
?>