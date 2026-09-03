<?php

    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    /* ---------------- DATABASE CONNECTION ---------------- */
    include "../config/luxe_database.php";

    /* ---------------- CHECK CONNECTION ---------------- */
    if ($conn->connect_error) {
        exit(json_encode([
            "status" => "error",
            "message" => "Database connection failed"
        ]));
    }

    /* ---------------- GET INPUT ---------------- */
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data["email"])) {
        exit(json_encode([
            "status" => "error",
            "message" => "Email required"
        ]));
    }

    $email = trim($data["email"]);
    $password = $data["password"] ?? null;

    /* ---------------- FIND USER ---------------- */
    $sql = "SELECT * FROM luxe_users WHERE email = '$email' LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows === 0) {
        exit(json_encode([
            "status" => "error",
            "message" => "User not found"
        ]));
    }

    $user = $result->fetch_assoc();

    /* ---------------- GOOGLE LOGIN ---------------- */
    if ($password === null) {
        echo json_encode([
            "status" => "success",
            "message" => "Google login successful",
            "user" => [
                "id" => $user["id"],
                "fullname" => $user["fullname"],
                "email" => $user["email"],
                "profile_img" => $user["profile_img"]
            ]
        ]);
        exit;
    }

    /* ---------------- NORMAL LOGIN ---------------- */
    if (password_verify($password, $user["password"])) {

        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "user" => [
                "id" => $user["id"],
                "fullname" => $user["fullname"],
                "email" => $user["email"],
                "profile_img" => $user["profile_img"]
            ]
        ]);
    } else {

        echo json_encode([
            "status" => "error",
            "message" => "Wrong password"
        ]);
    }

    $conn->close();
?>