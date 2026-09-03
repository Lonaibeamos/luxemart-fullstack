<?php

    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $email = $_POST["email"] ?? "";
    $password = $_POST["password"] ?? "";

    /* ---------------- VALIDATION ---------------- */
    if (!$email || !$password) {
        exit(json_encode([
            "status" => "error",
            "message" => "Email and password required"
        ]));
    }

    /* ---------------- FIND ADMIN ---------------- */
    $sql = "SELECT id, fullname, email, password, role 
            FROM luxe_admins 
            WHERE email = '$email'";

    $result = $conn->query($sql);
    $admin = $result->fetch_assoc();

    /* ---------------- CHECK USER ---------------- */
    if (!$admin) {
        exit(json_encode([
            "status" => "error",
            "message" => "Admin not found"
        ]));
    }

    /* ---------------- VERIFY PASSWORD ---------------- */
    if (!password_verify($password, $admin["password"])) {
        exit(json_encode([
            "status" => "error",
            "message" => "Invalid password"
        ]));
    }

    /* ---------------- SUCCESS ---------------- */
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

    $conn->close();
?>