<?php
include 'db_connection.php'; // Include your database connection

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data["googleId"], $data["email"])) {
    $googleId = $data["googleId"];
    $email = $data["email"];
    $firstName = isset($data["fName"]) ? $data["fName"] : null;
    $lastName = isset($data["lName"]) ? $data["lName"] : null;
    $picture = isset($data["picture"]) ? $data["picture"] : null;

    // Check if user already exists
    $query = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $query->bind_param("s", $email);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => true, "message" => "Google login successful!"]);
    } else {
        // Insert new user if not exists
        $insert = $conn->prepare("INSERT INTO users (google_id, first_name, last_name, email, profile_pic) VALUES (?, ?, ?, ?, ?)");
        $insert->bind_param("sssss", $googleId, $firstName, $lastName, $email, $picture);
        
        if ($insert->execute()) {
            echo json_encode(["success" => true, "message" => "Account created with Google!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database error: " . $insert->error]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid Google login data."]);
}

$conn->close();
?>