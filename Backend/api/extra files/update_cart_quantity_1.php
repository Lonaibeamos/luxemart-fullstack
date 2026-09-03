
<?php

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type");

    include_once __DIR__ . "/../config/luxe_database.php";

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid input"
        ]);
        exit;
    }

    $cart_id = (int)$data["cart_id"];
    $action = $data["action"];

    if (!$cart_id || !$action) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing data"
        ]);
        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | GET CART QUANTITY + PRODUCT STOCK
    |--------------------------------------------------------------------------
    */
    $get = $conn->prepare("
        SELECT
            c.quantity,
            p.stock
        FROM luxe_cart c
        INNER JOIN luxe_products p
            ON c.product_id = p.id
        WHERE c.id = ?
    ");

    $get->bind_param("i", $cart_id);
    $get->execute();

    $result = $get->get_result();

    if ($result->num_rows === 0) {

        echo json_encode([
            "status" => "error",
            "message" => "Cart item not found"
        ]);

        exit;
    }

    $row = $result->fetch_assoc();

    $currentQty = (int)$row["quantity"];
    $productStock = (int)$row["stock"];

    /*
    |--------------------------------------------------------------------------
    | HANDLE INCREASE
    |--------------------------------------------------------------------------
    */
    if ($action === "increase") {

        if ($productStock <= 0) {

            echo json_encode([
                "status" => "error",
                "message" => "Product is out of stock"
            ]);

            exit;
        }

        if ($currentQty >= $productStock) {

            echo json_encode([
                "status" => "error",
                "message" => "Maximum available stock reached"
            ]);

            exit;
        }

        $newQty = $currentQty + 1;
    }

    /*
    |--------------------------------------------------------------------------
    | HANDLE DECREASE
    |--------------------------------------------------------------------------
    */ else if ($action === "decrease") {

        $newQty = $currentQty - 1;

        if ($newQty < 1) {
            $newQty = 1;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID ACTION
    |--------------------------------------------------------------------------
    */ else {

        echo json_encode([
            "status" => "error",
            "message" => "Invalid action"
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CART
    |--------------------------------------------------------------------------
    */
    $update = $conn->prepare("
        UPDATE luxe_cart
        SET quantity = ?
        WHERE id = ?
    ");

    $update->bind_param("ii", $newQty, $cart_id);

    if ($update->execute()) {

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

    $update->close();
    $get->close();
    $conn->close();

?>
