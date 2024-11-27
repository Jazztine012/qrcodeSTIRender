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
$filePath = __DIR__ . '/../accessed_queues.txt'; // Resolve the absolute path

// Read and decode JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate JSON and queueID
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit();
}

if (!isset($data['queueID']) || !is_numeric($data['queueID'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid or missing queueID']);
    exit();
}

$queueID = (int) $data['queueID'];

try {
    // Append the queueID to the text file
    $result = file_put_contents($filePath, $queueID . PHP_EOL, FILE_APPEND);

    if ($result === false) {
        throw new Exception('Failed to write to file');
    }

    echo json_encode(['success' => true, 'message' => 'Queue ID added successfully']);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Error writing to file: ' . $e->getMessage()]);
}
?>
