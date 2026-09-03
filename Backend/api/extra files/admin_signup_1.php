<?php

    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $fullname = $_POST["fullname"] ?? "";
    $email = $_POST["email"] ?? "";
    $password = $_POST["password"] ?? "";
    $role = $_POST["role"] ?? "";
    $profile_img = $_POST["profile_img"] ?? "../assets/img/luxeProductCollection/profile img.jpg";

    if (!$fullname || !$email || !$password || !$role) {
        echo json_encode([
            "status" => "error",
            "message" => "All fields are required"
        ]);
        exit;
    }

    // check if email already exists
    $check = $conn->prepare("SELECT id FROM luxe_admins WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Email already exists"
        ]);
        exit;
    }

    // hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // insert admin (NOW INCLUDING profile_img)
    $stmt = $conn->prepare("
        INSERT INTO luxe_admins (fullname, email, password, profile_img, role, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $stmt->bind_param("sssss", $fullname, $email, $hashedPassword, $profile_img, $role);

    if ($stmt->execute()) {
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
?>