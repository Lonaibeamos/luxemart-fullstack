<?php

    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $email = $_POST["email"] ?? "";
    $password = $_POST["password"] ?? "";

    // ===============================
    // VALIDATION
    // ===============================
    if (!$email || !$password) {
        echo json_encode([
            "status" => "error",
            "message" => "Email and password required"
        ]);
        exit;
    }

    // ===============================
    // FIND ADMIN BY EMAIL
    // ===============================
    $stmt = $conn->prepare("SELECT id, fullname, email, password, role FROM luxe_admins WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $admin = $result->fetch_assoc();

    // ===============================
    // CHECK USER EXISTS
    // ===============================
    if (!$admin) {
        echo json_encode([
            "status" => "error",
            "message" => "Admin not found"
        ]);
        exit;
    }

    // ===============================
    // VERIFY PASSWORD
    // ===============================
    if (!password_verify($password, $admin["password"])) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid password"
        ]);
        exit;
    }

    // ===============================
    // SUCCESS RESPONSE
    // ===============================
    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "admin" => [
            "id" => $admin["id"],
            "fullname" => $admin["fullname"],
            "email" => $admin["email"],
            "role" => $admin["role"]
        ]
    ]);
?>