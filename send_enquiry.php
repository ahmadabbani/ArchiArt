<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set up error logging to a file in the same directory
$logFile = __DIR__ . '/php_errors.log';
ini_set('log_errors', 1);
ini_set('error_log', $logFile);

// Function to safely log errors
function safeLog($message)
{
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$company = $_POST['company'] ?? '';
$phone = $_POST['phone'] ?? '';
$description = $_POST['description'] ?? '';

// Log received data
safeLog("Received form data: " . print_r($_POST, true));

// Validate required fields
if (empty($name) || empty($email) || empty($phone) || empty($description)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Formspree endpoint
$formspreeEndpoint = 'https://formspree.io/f/YOUR_FORMSPREE_ID'; // You'll need to replace this with your Formspree ID

// Prepare the data to send to Formspree
$data = array(
    'name' => $name,
    'email' => $email,
    'company' => $company,
    'phone' => $phone,
    'description' => $description,
    '_subject' => 'New Enquiry from ' . $name
);

// Initialize cURL
$ch = curl_init($formspreeEndpoint);

// Set cURL options
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Accept: application/json'
));

// Log attempt
safeLog("Attempting to send to Formspree: " . print_r($data, true));

// Execute the request
try {
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($response === false) {
        throw new Exception('Curl error: ' . curl_error($ch));
    }

    curl_close($ch);

    // Check if the request was successful
    if ($httpCode >= 200 && $httpCode < 300) {
        safeLog("Formspree submission successful");
        echo json_encode(['success' => true, 'message' => 'Enquiry submitted successfully!']);
    } else {
        throw new Exception('Formspree returned status code: ' . $httpCode);
    }
} catch (Exception $e) {
    safeLog("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send enquiry. Please try again later.',
        'debug' => $e->getMessage() // Only for development, remove in production
    ]);
}
