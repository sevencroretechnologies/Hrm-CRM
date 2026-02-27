<?php

use Illuminate\Support\Facades\Http;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$url = 'http://localhost:8000/api/v1/opportunities';

$data = [
    'naming_series' => 'TEST-OPP-001',
    'opportunity_from' => 'lead',
    'status_id' => 1, // Assuming status 1 exists
    'items' => [
        [
            'item_code' => 'ITEM001',
            'item_name' => 'Test Item 1',
            'qty' => 10,
            'rate' => 100,
            'amount' => 1000
        ],
        [
            'item_code' => 'ITEM002',
            'item_name' => 'Test Item 2',
            'qty' => 5,
            'rate' => 200,
            'amount' => 1000
        ]
    ]
];

$response = Http::post($url, $data);

if ($response->successful()) {
    echo "Success!\n";
    echo "Body: " . $response->body() . "\n";
} else {
    echo "Error Status: " . $response->status() . "\n";
    echo "Error Body: " . substr(strip_tags($response->body()), 0, 500) . "...\n"; // Print first 500 chars of error
}
