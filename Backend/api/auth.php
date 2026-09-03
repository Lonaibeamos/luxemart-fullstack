<?php

    header("Content-Type: application/json");
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    $conn = new mysqli("localhost", "root", "", "luxecommerce_db");

    if ($conn->connect_error) {
        exit(json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- GET JSON INPUT ---------------- */
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        exit(json_encode([
            "status" => "error",
            "message" => "No data received"
        ]));
    }

    /* ---------------- GET VALUES ---------------- */
    $fullname = $data["fullname"] ?? "";
    $email = $data["email"] ?? "";
    $phone = $data["phone"] ?? null;
    $password = isset($data["password"]) ? password_hash($data["password"], PASSWORD_DEFAULT) : null;
    $profileImg = $data["profileImg"] ?? "";
    $address = "";

    /* ---------------- CHECK EMAIL EXISTS ---------------- */
    $checkSql = "SELECT id FROM luxe_users WHERE email = '$email'";
    $result = $conn->query($checkSql);

    if ($result->num_rows > 0) {
        exit(json_encode([
            "status" => "error",
            "message" => "Email already exists"
        ]));
    }

    /* ---------------- INSERT USER ---------------- */
    $sql = "INSERT INTO luxe_users 
    (fullname, email, password, phone, address, profile_img)
    VALUES 
    ('$fullname', '$email', '$password', '$phone', '$address', '$profileImg')";

    if ($conn->query($sql)) {
        echo json_encode([
            "status" => "success",
            "message" => "Account created successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
    }

    $conn->close();
?>