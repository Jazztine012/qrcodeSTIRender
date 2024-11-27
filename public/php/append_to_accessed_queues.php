<?php
// Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Exit for preflight
}

// Path to the text file
$filePath = '../accessed_queues.txt';

// Read JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['queueID']) || !is_numeric($data['queueID'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid queueID']);
    exit();
}

$queueID = (int) $data['queueID'];

try {
    // Append the queueID to the text file
    file_put_contents($filePath, $queueID . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Queue ID added successfully']);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Error writing to file: ' . $e->getMessage()]);
}
?>
