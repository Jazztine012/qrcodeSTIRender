<?php
// Allow requests from any origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // End execution for preflight requests
}

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection details
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'queue_management';

// Create connection
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500); // Internal server error
    echo json_encode(['message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Get the contact data from the query parameters
$mobile_number = isset($_GET['contactNumber']) ? trim($_GET['contactNumber']) : null;
$email_address = isset($_GET['email']) ? trim($_GET['email']) : null;

// Validate input
if (!$mobile_number && !$email_address) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'Both mobile_number and email_address are missing.']);
    exit();
}

// Example: Use a placeholder account_id or queue_number for this update
$queue_id = isset($_GET['id']) ? trim($_GET['id']) : null;
if (!$queue_id) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'queueID is missing.']);
    exit();
}

// Prepare SQL for updating the record
$sql = "UPDATE account_tasks 
        SET mobile_number = ?, email_address = ? 
        WHERE id = ?";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    http_response_code(500); // Internal server error
    echo json_encode(['message' => 'Failed to prepare SQL statement: ' . $conn->error]);
    exit();
}

// Bind parameters
$stmt->bind_param('sss', $mobile_number, $email_address, $queue_id);

// Execute the query
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        http_response_code(200); // OK
        echo json_encode(['message' => 'Contact information updated successfully.']);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['message' => 'No queue found for the given queue_number.']);
    }
} else {
    http_response_code(500); // Internal server error
    echo json_encode(['message' => 'Error updating contact information: ' . $stmt->error]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
