<?php
// Retrieve token from the request
$json = file_get_contents('php://input');
$data = json_decode($json, true);
$token = $data['token'];

// Connect to database and verify token
$stmt = $conn->prepare("SELECT is_accessed FROM queue WHERE token = ?");
$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();
$queue = $result->fetch_assoc();

if ($queue['is_accessed']) {
  // If the queue card has been accessed before
  echo json_encode(['status' => 'already_accessed']);
} else {
  // Update the queue as accessed
  $stmt = $conn->prepare("UPDATE queue SET is_accessed = TRUE WHERE token = ?");
  $stmt->bind_param('s', $token);
  $stmt->execute();

  echo json_encode(['status' => 'access_granted']);
}
?>
