<?php
include 'connect.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow requests from frontend (React)
header("Access-Control-Allow-Origin: http://localhost:3000"); // Change * to http://localhost:3000 in production
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Read JSON input from React
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Ensure input is properly received
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit();
}

// Database connection check
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection error"]);
    exit();
}

// Registration Logic
if (isset($data['signUp'])) {
    $firstName = trim($data['fName']);
    $lastName = trim($data['lName']);
    $email = trim($data['email']);
    $password = trim($data['password']); // Plain-text password

    if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All fields are required!"]);
        exit();
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email Address Already Exists!"]);
        exit();
    }

    // Check if username already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE firstName = ? AND lastName = ?");
    $stmt->bind_param("ss", $firstName, $lastName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Username Already Exists!"]);
        exit();
    }

    // Insert new user without password hashing (INSECURE)
    $insertStmt = $conn->prepare("INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)");
    $insertStmt->bind_param("ssss", $firstName, $lastName, $email, $password);

    if ($insertStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registration successful!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $insertStmt->error]);
    }
    exit();
}

// Login Logic
if (isset($data['signIn'])) {
    $email = trim($data['email']);
    $password = trim($data['password']); // Plain-text password

    if (empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Email and Password are required!"]);
        exit();
    }

    // Check credentials
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Plain-text password comparison (INSECURE)
        if ($password === $row['password']) {
            session_start();
            $_SESSION['email'] = $row['email'];  // Store email in session for future validation
            echo json_encode(["success" => true, "message" => "Login successful!", "firstName" => $row['firstName'], "lastName" => $row['lastName']]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect Email or Password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect Email or Password"]);
    }
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid Request"]);
?>
