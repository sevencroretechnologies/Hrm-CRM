<?php

$url = 'http://localhost:8000/api/v1/contacts';
$response = @file_get_contents($url);

if ($response === false) {
    echo "Error fetching URL: $url\n";
    print_r(error_get_last());
} else {
    $json = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "JSON Error: " . json_last_error_msg() . "\n";
    } else {
        echo "Data Count: " . count($json['data'] ?? []) . "\n";
        echo "Data Content:\n";
        print_r($json['data'] ?? 'No Data Key');
    }
}
