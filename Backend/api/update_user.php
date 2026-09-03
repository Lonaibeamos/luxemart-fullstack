<?php

    header("Content-Type: application/json");

    include "../config/luxe_database.php";

    /* ---------------- GET DATA ---------------- */
    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = $data["user_id"];
    $fullname = $data["fullname"];
    $email = $data["email"];
    $phone = $data["phone"];

    $current_password = $data["current_password"] ?? "";
    $new_password = $data["new_password"] ?? "";

    /* ---------------- GET USER ---------------- */
    $sql = "SELECT password FROM luxe_users WHERE id = $user_id";
    $result = $conn->query($sql);

    if ($result->num_rows == 0) {
        exit(json_encode([
            "status" => "error",
            "message" => "User not found"
        ]));
    }

    $user = $result->fetch_assoc();

    /* ---------------- CHANGE PASSWORD ---------------- */
    if ($current_password && $new_password) {

        if (!password_verify($current_password, $user["password"])) {
            exit(json_encode([
                "status" => "error",
                "message" => "Current password is incorrect"
            ]));
        }

        $hashedPassword = password_hash($new_password, PASSWORD_BCRYPT);

        $sql = "
        UPDATE luxe_users
        SET
            fullname = '$fullname',
            email = '$email',
            phone = '$phone',
            password = '$hashedPassword'
        WHERE id = $user_id
        ";
    } else {

        $sql = "
        UPDATE luxe_users
        SET
            fullname = '$fullname',
            email = '$email',
            phone = '$phone'
        WHERE id = $user_id
        ";
    }

    /* ---------------- UPDATE USER ---------------- */
    if ($conn->query($sql)) {

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

    $conn->close();
?>