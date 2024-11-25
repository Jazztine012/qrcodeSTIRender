<?php
// Allow requests from any origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'queue_management';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from login text inputs
$data = json_decode(file_get_contents("php://input"), true);
$queue_display_password = $data['queue_display_password'];

// Check if the account exists and fetch the password and encryption status
$sql = "SELECT account_password, is_password_encrypted FROM accounts WHERE account_id = 0";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $stored_password = $row['account_password'];
    $is_encrypted = $row['is_password_encrypted']; // 1 if encrypted, 0 if plain-text
    
    // Check the password based on encryption status
    if ($is_encrypted) {
        // If password is encrypted, use password_verify
        if (password_verify($queue_display_password, $stored_password)) {
            echo json_encode(['status' => 'success', 'message' => 'Login successful!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
        }
    } else {
        // If password is plain-text, do a direct comparison
        if ($queue_display_password === $stored_password) {
            echo json_encode(['status' => 'success', 'message' => 'Login successful!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
        }
    }
} else {
    // Error: account not found
    echo json_encode(['status' => 'error', 'message' => 'Account not found.']);
}

$stmt->close();
$conn->close();