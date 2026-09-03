<?php
    header("Content-Type: application/json");
    include "../config/luxe_database.php";

    $sql = "
    SELECT DATE(created_at) as day, COUNT(id) as total
    FROM luxe_orders
    GROUP BY DATE(created_at)
    ORDER BY day ASC
    ";

    $result = mysqli_query($conn, $sql);

    $data = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
?>