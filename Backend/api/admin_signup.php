<?php

    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $fullname = $_POST["fullname"] ?? "";
    $email = $_POST["email"] ?? "";
    $password = $_POST["password"] ?? "";
    $role = $_POST["role"] ?? "";
    $profile_img = $_POST["profile_img"] ?? "../assets/img/luxeProductCollection/profile img.jpg";

    /* ---------------- VALIDATION ---------------- */
    if (!$fullname || !$email || !$password || !$role) {
        exit(json_encode([
            "status" => "error",
            "message" => "All fields are required"
        ]));
    }

    /* ---------------- CHECK EMAIL EXISTS ---------------- */
    $checkSql = "SELECT id FROM luxe_admins WHERE email = '$email'";
    $result = $conn->query($checkSql);

    if ($result->num_rows > 0) {
        exit(json_encode([
            "status" => "error",
            "message" => "Email already exists"
        ]));
    }

    /* ---------------- HASH PASSWORD ---------------- */
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    /* ---------------- INSERT ADMIN ---------------- */
    $sql = "INSERT INTO luxe_admins 
    (fullname, email, password, profile_img, role, created_at)
    VALUES 
    ('$fullname', '$email', '$hashedPassword', '$profile_img', '$role', NOW())";

    if ($conn->query($sql)) {
        echo json_encode([
            "status" => "success",
            "message" => "Admin created successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create admin"
        ]);
    }

    $conn->close();
?>