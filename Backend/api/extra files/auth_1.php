<?php

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    // DATABASE CONNECTION
    $conn = new mysqli(
        "localhost",
        "root",
        "",
        "luxecommerce_db"
    );

    // CHECK CONNECTION
    if ($conn->connect_error) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->connect_error
        ]);
        exit;
    }

    // GET JSON DATA
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode([
            "status" => "error",
            "message" => "No data received"
        ]);
        exit;
    }

    // GET VALUES
    $fullname = trim($data["fullname"]);
    $email = trim($data["email"]);
    $phone = trim(isset($data["phone"])) ? $data["phone"] : null;
    $password = isset($data["password"]) ? password_hash($data["password"], PASSWORD_DEFAULT) : null;
    $profileImg = $data["profileImg"];

    // DEFAULT VALUES
    $address = "";

    // CHECK IF EMAIL EXISTS
    $checkEmail = $conn->prepare(
        "SELECT id FROM luxe_users WHERE email = ?"
    );

    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $result = $checkEmail->get_result();

    if ($result->num_rows > 0) {

        echo json_encode([
            "status" => "error",
            "message" => "Email already exists"
        ]);

        exit;
    }

    // INSERT USER
    $stmt = $conn->prepare(
        "INSERT INTO luxe_users
        (fullname, email, password, phone, address, profile_img)
        VALUES (?, ?, ?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "ssssss",
        $fullname,
        $email,
        $password,
        $phone,
        $address,
        $profile_img
    );

    if ($stmt->execute()) {

        echo json_encode([
            "status" => "success",
            "message" => "Account created successfully"
        ]);
    } else {

        echo json_encode([
            "status" => "error",
            "message" => $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
?>