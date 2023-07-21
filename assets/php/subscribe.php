<?php
require 'path-to-mailchimp-library/autoload.php'; // Include the Mailchimp PHP library

use MailchimpMarketing\ApiClient;
$apiKey = '698f66392db330b03364d76a3ff4c922-us21';
$listId = 'YOUR_LIST_ID';

$apiClient = new ApiClient();
$apiClient->setConfig([
    'apiKey' => $apiKey,
    'server' => 'us21',
]);

$email = $_POST['email_address'];

try {
    $response = $apiClient->lists->addListMember($listId, [
        'email_address' => $email,
        'status' => 'subscribed', // 'subscribed', 'unsubscribed', 'pending', 'cleaned'
    ]);

    // Handle successful subscription
    echo json_encode(['status' => 'success', 'message' => 'Successfully subscribed!']);
} catch (Exception $e) {
    // Handle error
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
