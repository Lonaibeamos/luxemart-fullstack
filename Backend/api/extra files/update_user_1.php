<?php
    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data["user_id"];
    $fullname = $data["fullname"];
    $email = $data["email"];
    $phone = $data["phone"];

    $current_password = $data["current_password"] ?? null;
    $new_password = $data["new_password"] ?? null;

    // 1. GET CURRENT USER PASSWORD FROM DB
    $stmt = $conn->prepare("SELECT password FROM luxe_users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        echo json_encode(["status" => "error", "message" => "User not found"]);
        exit;
    }

    // 2. PASSWORD UPDATE LOGIC (ONLY IF USER WANTS)
    if ($current_password && $new_password) {

        // check current password
        if (!password_verify($current_password, $user["password"])) {
            echo json_encode([
                "status" => "error",
                "message" => "Current password is incorrect"
            ]);
            exit;
        }

        // hash new password
        $hashedPassword = password_hash($new_password, PASSWORD_BCRYPT);

        // update everything INCLUDING password
        $stmt = $conn->prepare("
            UPDATE luxe_users 
            SET fullname = ?, email = ?, phone = ?, password = ?
            WHERE id = ?
        ");

        $stmt->bind_param("ssssi", $fullname, $email, $phone, $hashedPassword, $user_id);
    } else {

        // normal update (no password change)
        $stmt = $conn->prepare("
            UPDATE luxe_users 
            SET fullname = ?, email = ?, phone = ?
            WHERE id = ?
        ");

        $stmt->bind_param("sssi", $fullname, $email, $phone, $user_id);
    }

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "User updated successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Update failed"
        ]);
    }
?>