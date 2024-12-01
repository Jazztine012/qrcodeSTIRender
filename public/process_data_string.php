<?php
// Allow requests from any origin
header('Access-Control-Allow-Origin: https://qrcodesti.onrender.com');
// Allow specific HTTP methods (GET, POST, etc.)
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
// Allow specific headers
header('Access-Control-Allow-Headers: Content-Type');
// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // End execution for preflight requests
}
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if a POST request is made
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the data from the POST request
    $data = json_decode(file_get_contents('php://input'), true);

    // Ensure required fields are provided
    if (isset($data['string']) && isset($data['action'])) {
        $simple_string = $data['string'];
        $action = $data['action']; // 'encrypt' or 'decrypt'

        // Define the cipher method
        $ciphering = "AES-128-CTR";
        $iv_length = openssl_cipher_iv_length($ciphering);
        $options = 0;

        // Non-NULL Initialization Vector
        $encryption_iv = '1234567891011121';
        $decryption_iv = $encryption_iv; // Same IV for decryption

        // Store the encryption/decryption key
        $encryption_key = "YourSecureKey";
        $decryption_key = $encryption_key;

        if ($action === 'encrypt') {
            // Encrypt the string
            $encrypted_string = openssl_encrypt($simple_string, $ciphering, $encryption_key, $options, $encryption_iv);
            // Return the encrypted string as JSON
            echo json_encode([
                'status' => 'success',
                'action' => 'encrypt',
                'result' => $encrypted_string
            ]);
        } elseif ($action === 'decrypt') {
            // Decrypt the string
            $decrypted_string = openssl_decrypt($simple_string, $ciphering, $decryption_key, $options, $decryption_iv);
            // Return the decrypted string as JSON
            echo json_encode([
                'status' => 'success',
                'action' => 'decrypt',
                'result' => $decrypted_string
            ]);
        } else {
            // Invalid action
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid action specified. Use "encrypt" or "decrypt".'
            ]);
        }
    } else {
        // Missing required fields
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields: "string" and "action".'
        ]);
    }
} else {
    // Invalid request method
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method. Use POST.'
    ]);
}
?>
