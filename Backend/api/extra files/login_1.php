<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "luxecommerce_db");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"])) {
    echo json_encode([
        "status" => "error",
        "message" => "Email required"
    ]);
    exit;
}

$email = trim($data["email"]);
$password = $data["password"] ?? null;

// FIND USER
$stmt = $conn->prepare(
    "SELECT * FROM luxe_users WHERE email = ? LIMIT 1"
);

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);

    exit;
}

$user = $result->fetch_assoc();


// ==========================
// GOOGLE LOGIN
// ==========================
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


// ==========================
// NORMAL LOGIN
// ==========================
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

$stmt->close();
$conn->close();
