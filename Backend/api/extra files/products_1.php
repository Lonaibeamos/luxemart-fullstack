<?php
error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header("Content-Type: application/json");

    // connect to database
    include "/opt/lampp/htdocs/smart-ecommerce-app/Backend/config/luxe_database.php";

    // check connection
    if (!$conn) {
        die(json_encode(["error" => "Database connection failed"]));
    }

    // select products
    $sql = "SELECT * FROM luxe_products";
    $result = mysqli_query($conn, $sql);

    // check query
    if (!$result) {
        die(json_encode(["error" => mysqli_error($conn)]));
    }

    $products = [];

    // fetch data
    while ($row = mysqli_fetch_assoc($result)) {
        $products[] = $row;
    }

    // return JSON response
    echo json_encode($products);
?>